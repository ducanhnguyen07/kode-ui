import { useAppSelector } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
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
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isInitializedRef = useRef(false);
  const { token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [vmCreationProgress, setVmCreationProgress] = useState<number>(0);
  const [terminalReady, setTerminalReady] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      console.error("❌ No token found - redirecting to login");
      navigate("/login");
      return;
    }

    if (isInitializedRef.current) {
      console.log("⚠️ Already initialized, skipping");
      return;
    }

    if (!terminalRef.current || !labSessionId) {
      console.error("❌ Missing requirements:", {
        hasTerminalRef: !!terminalRef.current,
        labSessionId,
      });
      return;
    }

    isInitializedRef.current = true;
    console.log("🚀 Initializing terminal for session:", labSessionId);
    console.log("🔑 Token available:", !!token);

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
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);

    const wsUrl = `ws://localhost:9998/ws/pod-logs?podName=vm-${labSessionId}&token=${encodeURIComponent(
      token,
    )}`;
    console.log("🔗 Connecting WebSocket with token");

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setVmCreationProgress(data.progress || 0);
          term.write(`\r\n${data.message}\r\n`);
        } else if (data.type === "terminal_ready") {
          console.log("🎉 VM Ready! Switching to terminal mode");
          term.write("\r\n🎉 VM Setup Complete!\r\n");
          term.write(`\r\n${data.message}\r\n`);
          term.write("⏳ Terminal ready. You can now type commands...\r\n\r\n");

          setTerminalReady(true);
          setVmCreationProgress(100);
        } else if (
          data.type === "info" ||
          data.type === "success" ||
          data.type === "error"
        ) {
          term.write(`\r\n${data.message}\r\n`);
        } else {
          term.write(event.data);
        }
      } catch (error) {
        term.write(event.data);
      }
    };

    socket.onclose = (event) => {
      console.log("🔌 WebSocket closed:", event.code, event.reason);

      if (event.code !== 1000) {
        term.write("\r\n❌ Connection closed.\r\n");

        if (event.code === 1002 || event.code === 1006) {
          term.write("⚠️ Authentication error. Redirecting to login...\r\n");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      term.write("\r\n❌ Connection error\r\n");
    };

    const onDataDisposable = term.onData((data) => {
      if (terminalReady && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });

    return () => {
      console.log("🧹 Cleanup on unmount");
      onDataDisposable.dispose();

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000);
      }

      term.dispose();
      window.removeEventListener("resize", handleResize);
      isInitializedRef.current = false;
    };
  }, [token, labSessionId, navigate, terminalReady]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
};

export default Console;
