// src/pages/terminal/hooks/useSingleWebSocket.ts
import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";

interface WebSocketMessage {
  type: string;
  message: string;
  data?: any;
  timestamp?: number;
}

interface UseSingleWebSocketProps {
  labSessionId: number;
  token: string;
  termRef: React.RefObject<Terminal | null>;
}

export const useSingleWebSocket = ({
  labSessionId,
  token,
  termRef,
}: UseSingleWebSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("waiting");
  const [setupProgress, setSetupProgress] = useState<number>(0);
  const [isSetupPhase, setIsSetupPhase] = useState<boolean>(true);

  useEffect(() => {
    if (!labSessionId || !token || !termRef.current) return;

    const term = termRef.current;
    const vmName = `vm-${labSessionId}`;
    const wsUrl = `ws://localhost:9998/ws/pod-logs?podName=${vmName}&token=${encodeURIComponent(
      token,
    )}`;

    console.log("🔗 Connecting to WebSocket:", wsUrl);
    term.write("⏳ Creating your lab environment...\r\n\r\n");

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        // Handle based on current phase
        if (isSetupPhase) {
          handleSetupMessage(data, term);
        } else {
          handleTerminalMessage(data, term);
        }
      } catch (error) {
        // Not JSON - raw terminal output
        if (!isSetupPhase) {
          term.write(event.data);
        } else {
          console.error("Error parsing message:", error);
          term.write(event.data);
        }
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
      if (isSetupPhase) {
        setConnectionStatus("disconnected");
        term.write("\r\n❌ Connection lost during setup\r\n");
      } else {
        term.write("\r\n❌ Terminal connection closed\r\n");
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setConnectionStatus("error");
      term.write("\r\n❌ WebSocket connection error\r\n");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [labSessionId, token, termRef]);

  const handleSetupMessage = (data: WebSocketMessage, term: Terminal) => {
    switch (data.type) {
      case "progress":
        if (data.data?.percentage !== undefined) {
          setSetupProgress(data.data.percentage);
          term.write(
            `\r\n📊 Progress: ${data.data.percentage}% - ${data.message}\r\n`,
          );
        }
        break;

      case "info":
        term.write(`ℹ️  ${data.message}\r\n`);
        break;

      case "success":
        term.write(`✅ ${data.message}\r\n`);
        break;

      case "error":
        term.write(`❌ ${data.message}\r\n`);
        setConnectionStatus("error");
        break;

      case "terminal_ready":
        console.log("🎉 Terminal ready! Switching to terminal mode...");
        term.write(`\r\n${data.message}\r\n`);
        term.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\r\n\r\n");

        // Switch to terminal phase - SAME WebSocket
        setIsSetupPhase(false);
        setConnectionStatus("terminal");
        setSetupProgress(100);

        // Enable terminal input
        enableTerminalInput(term);
        break;
    }
  };

  const handleTerminalMessage = (data: WebSocketMessage, term: Terminal) => {
    // In terminal phase, we might still receive JSON messages
    // or backend might switch to raw output
    if (data.message) {
      term.write(data.message);
    }
  };

  const enableTerminalInput = (term: Terminal) => {
    if (!socketRef.current) return;

    const ws = socketRef.current;

    // Send user input to backend
    const onDataDisposable = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Store disposable for cleanup
    (term as any)._onDataDisposable = onDataDisposable;
  };

  return {
    connectionStatus,
    setupProgress,
    isSetupPhase,
  };
};
