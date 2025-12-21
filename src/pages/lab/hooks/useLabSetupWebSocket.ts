// src/pages/Lab/hooks/useLabSetupWebSocket.ts
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface WebSocketMessage {
  type: string;
  message: string;
  data?: any;
}

interface UseLabSetupWebSocketParams {
  sessionId: string | undefined;
  labId: string | undefined;
  token: string | null;
}

export const useLabSetupWebSocket = ({
  sessionId,
  labId,
  token,
}: UseLabSetupWebSocketParams) => {
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Lab provisioned. Getting ready...");

  const calculateProgress = (message: string, type: string): number => {
    const lowerMessage = message.toLowerCase();

    if (
      type === "connection" ||
      lowerMessage.includes("connected") ||
      lowerMessage.includes("kết nối")
    ) {
      return 10;
    }

    if (
      lowerMessage.includes("creating vm") ||
      lowerMessage.includes("đang tạo vm") ||
      lowerMessage.includes("tạo vm") ||
      lowerMessage.includes("creating resources")
    ) {
      return 20;
    }

    if (
      lowerMessage.includes("vm resources created") ||
      lowerMessage.includes("tạo thành công") ||
      lowerMessage.includes("resources created successfully")
    ) {
      return 35;
    }

    if (
      lowerMessage.includes("waiting for vm") ||
      lowerMessage.includes("đang chờ vm") ||
      lowerMessage.includes("waiting for pod")
    ) {
      return 45;
    }

    if (
      lowerMessage.includes("vm is now running") ||
      lowerMessage.includes("vm đang chạy") ||
      lowerMessage.includes("pod is running") ||
      lowerMessage.includes("running:")
    ) {
      return 55;
    }

    if (
      lowerMessage.includes("starting setup") ||
      lowerMessage.includes("executing setup") ||
      lowerMessage.includes("đang cài đặt") ||
      lowerMessage.includes("setup steps execution")
    ) {
      return 65;
    }

    if (
      lowerMessage.includes("setup completed") ||
      lowerMessage.includes("hoàn tất cài đặt") ||
      lowerMessage.includes("setup successfully")
    ) {
      return 85;
    }

    if (
      lowerMessage.includes("ready") ||
      lowerMessage.includes("sẵn sàng") ||
      lowerMessage.includes("environment is ready") ||
      lowerMessage.includes("lab is ready")
    ) {
      return 100;
    }

    if (type === "warning") {
      return progress;
    }

    return progress;
  };

  useEffect(() => {
    if (!sessionId || !token) {
      navigate(`/courses`);
      return;
    }

    const vmName = `vm-${sessionId}`;
    const socketUrl = `ws://localhost:9998/ws/pod-logs?podName=${vmName}&token=${encodeURIComponent(
      token,
    )}`;

    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to setup WebSocket");
      setStatus("Kết nối thành công, đang khởi tạo...");
      setProgress(5);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        const newProgress = calculateProgress(data.message, data.type);
        setProgress(newProgress);
        setStatus(data.message || "Processing...");

        if (data.type === "terminal_ready" || newProgress === 100) {
          setTimeout(() => {
            navigate(`/labs/${labId}/${sessionId}`);
          }, 1000);
        }

        if (data.type === "error") {
          setStatus("Lỗi: " + data.message);
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    ws.onerror = () => {
      setStatus("Lỗi kết nối");
    };

    return () => {
      ws.close();
    };
  }, [sessionId, labId, navigate, token]);

  return { progress, status };
};
