import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface WebSocketMessage {
  type: string;
  message: string;
  metadata?: {
    percentage?: number;
    currentStep?: number;
    totalSteps?: number;
  };
}

interface UseLabSetupWebSocketParams {
  sessionId: string | undefined;
  labId: string | undefined;
  socketUrl: string | undefined;
}

export const useLabSetupWebSocket = ({
  sessionId,
  labId,
  socketUrl,
}: UseLabSetupWebSocketParams) => {
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Lab provisioned. Getting ready...");

  useEffect(() => {
    if (!sessionId || !socketUrl) {
      navigate(`/courses`);
      return;
    }

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

        // Chỉ cập nhật progress từ metadata.percentage
        if (
          data.type === "progress" &&
          data.metadata?.percentage !== undefined
        ) {
          setProgress(data.metadata.percentage);
          setStatus(`${data.metadata.percentage}%`);
        }

        if (data.type === "terminal_ready") {
          setProgress(100);
          setStatus("100%");
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
  }, [sessionId, labId, navigate, socketUrl]);

  return { progress, status };
};
