// kode-react/src/pages/Terminal/ui/Page/Console.tsx
import { useAppSelector } from "@/app/hooks";
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface ConsoleProps {
  labSessionId: number;
}

const Console: React.FC<ConsoleProps> = ({ labSessionId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const logsSocketRef = useRef<WebSocket | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  const [connectionStatus, setConnectionStatus] = useState<string>("waiting");
  const [vmCreationProgress, setVmCreationProgress] = useState<number>(0);
  const [terminalReady, setTerminalReady] = useState<boolean>(false);

  useEffect(() => {
    if (!terminalRef.current || !labSessionId || !token) {
      console.error("Missing requirements:", {
        hasTerminalRef: !!terminalRef.current,
        labSessionId,
        hasToken: !!token,
      });
      return;
    }

    console.log("🚀 Initializing terminal for session:", labSessionId);

    // --- 1. KHỞI TẠO XTERM.JS ---
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "monospace",
      fontSize: 14,
      theme: {
        background: "#1f2937",
        foreground: "#d1d5db",
        cursor: "#f97316",
      },
    });
    termRef.current = term;

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    // --- 2. PHASE 1: Connect to VM creation logs ---
    const vmName = `vm-${labSessionId}`;
    const logsWsUrl = `ws://localhost:9998/ws/pod-logs?podName=${vmName}&token=${encodeURIComponent(
      token,
    )}`;

    console.log("🔗 Connecting to VM creation logs:", logsWsUrl);
    term.write("⏳ Creating your lab environment...\r\n\r\n");

    const logsSocket = new WebSocket(logsWsUrl);
    logsSocketRef.current = logsSocket;

    logsSocket.onopen = () => {
      console.log("✅ VM logs WebSocket connected");
      setConnectionStatus("creating-vm");
    };

    logsSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Update progress
        if (data.type === "progress" && data.data) {
          const percentage = data.data.percentage || 0;
          setVmCreationProgress(percentage);
          term.write(`\r\n📊 Progress: ${percentage}% - ${data.message}\r\n`);
        }
        // Info logs
        else if (data.type === "info") {
          term.write(`ℹ️  ${data.message}\r\n`);
        }
        // Success logs
        else if (data.type === "success") {
          term.write(`✅ ${data.message}\r\n`);
        }
        // Error logs
        else if (data.type === "error") {
          term.write(`❌ ${data.message}\r\n`);
          setConnectionStatus("error");
        }
        // Terminal Ready Event
        else if (data.type === "terminal_ready") {
          console.log("🎉 Terminal is ready!");
          term.write(`\r\n${data.message}\r\n`);
          term.write("⏳ Connecting to terminal...\r\n\r\n");

          setTerminalReady(true);
          logsSocket.close(); // Close logs socket
        }
      } catch (error) {
        console.error("Error parsing logs message:", error);
        term.write(event.data); // Fallback to raw text
      }
    };

    logsSocket.onclose = () => {
      console.log("🔌 VM logs WebSocket closed");
    };

    logsSocket.onerror = (error) => {
      console.error("❌ VM logs WebSocket error:", error);
      term.write("\r\n❌ Failed to connect to VM creation logs\r\n");
      setConnectionStatus("error");
    };

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up");
      if (logsSocket.readyState === WebSocket.OPEN) {
        logsSocket.close();
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [labSessionId, token]);

  // --- 3. PHASE 2: Connect to terminal after VM is ready ---
  useEffect(() => {
    if (!terminalReady || !termRef.current || !token) {
      return;
    }

    const term = termRef.current;
    const terminalWsUrl = `ws://localhost:9998/ws/terminal/${labSessionId}?token=${encodeURIComponent(
      token,
    )}`;

    console.log(
      "🔗 Connecting to terminal WebSocket:",
      terminalWsUrl.replace(token, "***TOKEN***"),
    );

    const terminalSocket = new WebSocket(terminalWsUrl);
    socketRef.current = terminalSocket;

    terminalSocket.onopen = () => {
      console.log("✅ Terminal WebSocket connected");
      setConnectionStatus("connected");
    };

    terminalSocket.onmessage = (event) => {
      try {
        term.write(event.data);
      } catch (error) {
        console.error("Error writing to terminal:", error);
      }
    };

    terminalSocket.onclose = (event) => {
      console.log("🔌 Terminal WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");
      term.write("\r\n❌ Terminal connection closed.\r\n");

      if (event.code === 1006 || event.code === 1002) {
        term.write("⚠️ Authentication error. Please login again.\r\n");
      }
    };

    terminalSocket.onerror = (error) => {
      console.error("❌ Terminal WebSocket error:", error);
      setConnectionStatus("error");
      term.write("\r\n❌ Terminal connection error\r\n");
    };

    // Send data from terminal to backend
    const onDataDisposable = term.onData((data) => {
      if (terminalSocket.readyState === WebSocket.OPEN) {
        terminalSocket.send(data);
      } else {
        console.warn("Cannot send data: Terminal WebSocket not open");
      }
    });

    return () => {
      onDataDisposable.dispose();
      if (terminalSocket.readyState === WebSocket.OPEN) {
        terminalSocket.close();
      }
    };
  }, [terminalReady, labSessionId, token]);

  return (
    <div className="relative h-full w-full">
      <div ref={terminalRef} className="h-full w-full" />

      {/* Loading overlay */}
      {connectionStatus === "waiting" || connectionStatus === "creating-vm" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="text-center text-white">
            <div className="mb-4 text-xl font-semibold">
              {connectionStatus === "waiting"
                ? "Initializing..."
                : "Creating Lab Environment"}
            </div>
            <div className="mb-2">Progress: {vmCreationProgress}%</div>
            <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${vmCreationProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Console;
