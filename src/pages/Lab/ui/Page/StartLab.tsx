// kode-react/src/pages/Lab/ui/Page/StartLab.tsx
import { useAppSelector } from "@/app/hooks";
import apiClient from "@/shared/api/apiClient";
import { AlertCircle, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface LabDetail {
  id: number;
  title: string;
}

interface UserLabSessionResponse {
  sessionId: number;
  status: string;
  setupStartedAt: string;
  socketUrl: string;
}

interface WebSocketLogMessage {
  type: "connection" | "info" | "success" | "warning" | "error";
  message: string;
  metadata?: any;
}

const StartLab: FC = () => {
  const { courseId, labId } = useParams<{ courseId: string; labId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);

  const [labName, setLabName] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!labId) {
      setPageError("Không tìm thấy ID của lab trong URL.");
      setIsPageLoading(false);
      return;
    }

    const fetchLabDetails = async () => {
      try {
        const response = await apiClient.get<LabDetail>(`/labs/${labId}`);
        setLabName(response.data.title);
      } catch (err: any) {
        console.error("Error fetching lab details:", err);
        setPageError(err.message || "Không thể tải thông tin lab.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchLabDetails();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [labId]);

  const calculateProgress = (message: string, type: string): number => {
    const lowerMessage = message.toLowerCase();

    // Connection phase: 0-10%
    if (
      type === "connection" ||
      lowerMessage.includes("connected") ||
      lowerMessage.includes("kết nối")
    ) {
      return 10;
    }

    // VM Creation phase: 10-30%
    if (
      lowerMessage.includes("creating vm") ||
      lowerMessage.includes("đang tạo vm") ||
      lowerMessage.includes("tạo vm") ||
      lowerMessage.includes("creating resources")
    ) {
      return 20;
    }

    // VM Created phase: 30-40%
    if (
      lowerMessage.includes("vm resources created") ||
      lowerMessage.includes("tạo thành công") ||
      lowerMessage.includes("resources created successfully")
    ) {
      return 35;
    }

    // Waiting for VM phase: 40-50%
    if (
      lowerMessage.includes("waiting for vm") ||
      lowerMessage.includes("đang chờ vm") ||
      lowerMessage.includes("waiting for pod")
    ) {
      return 45;
    }

    // VM Running phase: 50-60%
    if (
      lowerMessage.includes("vm is now running") ||
      lowerMessage.includes("vm đang chạy") ||
      lowerMessage.includes("pod is running") ||
      lowerMessage.includes("running:")
    ) {
      return 55;
    }

    // Setup Steps Starting phase: 60-70%
    if (
      lowerMessage.includes("starting setup") ||
      lowerMessage.includes("executing setup") ||
      lowerMessage.includes("đang cài đặt") ||
      lowerMessage.includes("setup steps execution")
    ) {
      return 65;
    }

    // Setup Steps Completed phase: 70-90%
    if (
      lowerMessage.includes("setup completed") ||
      lowerMessage.includes("hoàn tất cài đặt") ||
      lowerMessage.includes("setup successfully")
    ) {
      return 85;
    }

    // Ready phase: 90-100%
    if (
      lowerMessage.includes("ready") ||
      lowerMessage.includes("sẵn sàng") ||
      lowerMessage.includes("environment is ready") ||
      lowerMessage.includes("lab is ready")
    ) {
      return 100;
    }

    // Warning - keep current progress
    if (type === "warning") {
      return progress;
    }

    return progress;
  };

  const getStepDescription = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("connection") ||
      lowerMessage.includes("kết nối")
    ) {
      return "Kết nối hệ thống";
    }
    if (
      lowerMessage.includes("creating vm") ||
      lowerMessage.includes("tạo vm")
    ) {
      return "Khởi tạo máy ảo";
    }
    if (
      lowerMessage.includes("waiting for vm") ||
      lowerMessage.includes("chờ vm")
    ) {
      return "Chờ máy ảo khởi động";
    }
    if (lowerMessage.includes("running")) {
      return "Máy ảo đang chạy";
    }
    if (lowerMessage.includes("setup") || lowerMessage.includes("cài đặt")) {
      return "Cài đặt môi trường";
    }
    if (lowerMessage.includes("ready") || lowerMessage.includes("sẵn sàng")) {
      return "Hoàn tất";
    }

    return "Đang xử lý";
  };

  const connectToInfraWebSocket = (
    socketUrl: string,
    sessionId: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("Connecting to WebSocket:", socketUrl);
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to infrastructure WebSocket");
        setSetupStatus("Kết nối thành công, đang bắt đầu khởi tạo...");
        setCurrentStep("Kết nối hệ thống");
        setProgress(5);
        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketLogMessage = JSON.parse(event.data);
          console.log("📨 Received:", data);

          const newProgress = calculateProgress(data.message, data.type);
          const stepDescription = getStepDescription(data.message);

          setSetupStatus(data.message);
          setCurrentStep(stepDescription);
          setProgress(newProgress);

          // Handle completion
          if (newProgress === 100) {
            console.log("✅ Setup completed, redirecting...");
            setSetupStatus("Hoàn tất! Đang chuyển hướng...");

            setTimeout(() => {
              ws.close();
              navigate(`/labs/${labId}/${sessionId}`);
            }, 1500);
          }

          // Handle errors
          if (data.type === "error") {
            console.error("❌ Error from infrastructure:", data.message);
            setStartError(data.message);
            setIsStarting(false);
            ws.close();
          }
        } catch (e) {
          console.error("❌ Error parsing WebSocket message:", e);
          console.log("Raw message:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setStartError("Lỗi kết nối đến hệ thống hạ tầng");
        setIsStarting(false);
        reject(new Error("Không thể kết nối WebSocket"));
      };

      ws.onclose = (event) => {
        console.log(
          "🔌 Infrastructure WebSocket closed",
          event.code,
          event.reason,
        );
      };
    });
  };

  const handleStartLab = async () => {
    if (!user || !user.id) {
      setStartError("Bạn cần đăng nhập để thực hiện bài Lab này.");
      return;
    }

    setIsStarting(true);
    setStartError(null);
    setSetupStatus("Đang gửi yêu cầu khởi tạo môi trường...");
    setCurrentStep("Khởi tạo");
    setProgress(0);

    try {
      console.log("🚀 Creating lab session...");
      const response = await apiClient.post<UserLabSessionResponse>(
        "/lab-sessions",
        {
          labId: Number(labId),
          userId: user.id,
        },
      );

      console.log("📦 Response:", response.data);

      const { sessionId, socketUrl } = response.data;
      sessionIdRef.current = sessionId;

      console.log("sessionId", sessionId);
      console.log("socketUrl", socketUrl);
      if (!sessionId) {
        throw new Error("Không nhận được Session ID từ server.");
      }

      if (!socketUrl) {
        throw new Error("Không nhận được Socket URL từ server.");
      }

      console.log("✅ Session created:", sessionId);
      console.log("🔗 Socket URL:", socketUrl);

      // Connect to WebSocket
      await connectToInfraWebSocket(socketUrl, sessionId);
    } catch (err: any) {
      console.error("❌ Start lab error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Không thể khởi tạo Lab.";
      setStartError(message);
      setIsStarting(false);
    }
  };

  const renderMainContent = () => {
    if (isPageLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin" />
          <span className="mt-4 text-lg">Đang tải thông tin lab...</span>
        </div>
      );
    }

    if (pageError) {
      return (
        <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            Đã xảy ra lỗi
          </h2>
          <p className="py-4 text-red-600">{pageError}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Quay lại
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <ShieldCheck className="mx-auto h-16 w-16 text-blue-500" />
        <h2 className="mt-4 text-3xl font-bold text-gray-800">
          Bắt đầu môi trường thực hành?
        </h2>
        <p className="py-4 text-gray-600">
          Một môi trường lab riêng biệt sẽ được khởi tạo cho bạn ({labName}).
        </p>

        {startError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            <AlertCircle className="mx-auto mb-2 h-6 w-6" />
            <p className="text-sm">{startError}</p>
          </div>
        )}

        {isStarting && (
          <div className="mb-6 space-y-3">
            {/* Progress Bar */}
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Current Step */}
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{currentStep}</span>
              </div>
            </div>

            {/* Detailed Status */}
            <div className="text-xs text-gray-500">
              <p className="mb-1">{setupStatus}</p>
              <p className="font-semibold">{progress}%</p>
            </div>

            {/* Progress Steps Indicator */}
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span
                className={progress >= 10 ? "font-medium text-blue-600" : ""}
              >
                Kết nối
              </span>
              <span
                className={progress >= 35 ? "font-medium text-blue-600" : ""}
              >
                Tạo VM
              </span>
              <span
                className={progress >= 55 ? "font-medium text-blue-600" : ""}
              >
                Khởi động
              </span>
              <span
                className={progress >= 85 ? "font-medium text-blue-600" : ""}
              >
                Cài đặt
              </span>
              <span
                className={progress >= 100 ? "font-medium text-blue-600" : ""}
              >
                Hoàn tất
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            disabled={isStarting}
            className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleStartLab}
            disabled={isStarting}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isStarting ? "Đang xử lý..." : "Bắt đầu Lab"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <span className="font-bold text-white">i</span>
            </div>
            <span className="font-semibold text-gray-800">Lab Platform</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
            {labName && (
              <>
                <ChevronRight size={16} />
                <span className="font-medium text-gray-700">{labName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 pt-16">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default StartLab;
