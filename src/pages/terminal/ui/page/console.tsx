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
  const { token } = useAppSelector((state) => state.auth);

  const [connectionStatus, setConnectionStatus] = useState<string>("waiting");
  const [vmCreationProgress, setVmCreationProgress] = useState<number>(0);
  const [terminalReady, setTerminalReady] = useState<boolean>(false);

  useEffect(() => {
    if (!terminalRef.current || !labSessionId || !token) {
      return;
    }

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

    // PHASE 1: Pod logs
    const logsWsUrl = `ws://localhost:9998/ws/pod-logs?podName=vm-${labSessionId}&token=${encodeURIComponent(
      token,
    )}`;
    const logsSocket = new WebSocket(logsWsUrl);

    logsSocket.onopen = () => {
      setConnectionStatus("creating-vm");
    };

    logsSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setVmCreationProgress(data.progress);
          term.write(`\r\n${data.message}\r\n`);
        } else if (data.type === "terminal_ready") {
          term.write("\r\n🎉 VM Setup Complete!\r\n");
          term.write(`\r\n${data.message}\r\n`);
          term.write("⏳ Connecting to terminal...\r\n\r\n");
          setTerminalReady(true);
        }
      } catch (error) {
        term.write(event.data);
      }
    };

    logsSocket.onerror = (error) => {
      console.error("❌ VM logs WebSocket error:", error);
      term.write("\r\n❌ Failed to connect to VM creation logs\r\n");
      setConnectionStatus("error");
    };

    return () => {
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

  // PHASE 2: Terminal
  useEffect(() => {
    if (!terminalReady || !termRef.current || !token) {
      return;
    }

    const term = termRef.current;
    const terminalWsUrl = `ws://localhost:9998/ws/terminal/${labSessionId}?token=${encodeURIComponent(
      token,
    )}`;

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

    const onDataDisposable = term.onData((data) => {
      if (terminalSocket.readyState === WebSocket.OPEN) {
        terminalSocket.send(data);
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
