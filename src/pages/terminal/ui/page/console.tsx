import { useAppSelector } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface ConsoleProps {
  labSessionId: number;
}
export const Console: React.FC<ConsoleProps> = ({ labSessionId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isInitializedRef = useRef(false);
  const { token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

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
      console.error("❌ Missing requirements");
      return;
    }

    isInitializedRef.current = true;
    console.log("🚀 Initializing terminal");

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "monospace",
      fontSize: 14,
      disableStdin: false, // ✅ QUAN TRỌNG - cho phép input
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

    // ✅ FOCUS terminal
    setTimeout(() => {
      term.focus();
      console.log("✅ Terminal focused and ready for input");
    }, 100);

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);

    const wsUrl = `ws://localhost:9998/ws/pod-logs?podName=vm-${labSessionId}&token=${encodeURIComponent(
      token,
    )}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "terminal_ready") {
          console.log("🎉 VM Ready! Terminal mode enabled");
          term.write("\r\n🎉 VM Setup Complete!\r\n");
          term.write(`\r\n${data.message}\r\n\r\n`);
          setTerminalReady(true);

          // ✅ Focus lại sau khi ready
          setTimeout(() => term.focus(), 100);
        } else if (
          data.type === "progress" ||
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
      console.log("🔌 WebSocket closed");
      if (event.code !== 1000) {
        term.write("\r\n❌ Connection closed.\r\n");
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      term.write("\r\n❌ Connection error\r\n");
    };

    // ✅ THÊM DEBUG LOG
    const onDataDisposable = term.onData((data) => {
      console.log("🎹 Key pressed:", data, "charCode:", data.charCodeAt(0));
      console.log("🔍 terminalReady:", terminalReady);
      console.log("🔍 socket state:", socket.readyState);

      if (socket.readyState === WebSocket.OPEN) {
        console.log("✅ Sending to backend");
        socket.send(data);
      } else {
        console.warn(
          "⚠️ Cannot send - terminalReady:",
          terminalReady,
          "socket:",
          socket.readyState,
        );
      }
    });

    return () => {
      console.log("🧹 Cleanup");
      onDataDisposable.dispose();
      socket.close(1000);
      term.dispose();
      window.removeEventListener("resize", handleResize);
      isInitializedRef.current = false;
    };
  }, [token, labSessionId, navigate, terminalReady]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={terminalRef}
        className="h-full w-full"
        style={{
          pointerEvents: "auto", // ✅ Đảm bảo nhận events
          cursor: "text", // ✅ Hiển thị text cursor
        }}
      />
    </div>
  );
};
