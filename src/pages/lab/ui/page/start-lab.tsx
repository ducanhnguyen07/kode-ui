import { useAppSelector } from "@/app/hooks";
import apiClient from "@/shared/api/apiClient";
import { Lab } from "@/types/lab";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorScreen } from "../components/error-sceen";
import { LabHeader } from "../components/lab-header";
import { LoadingScreen } from "../components/loading-screen";

interface UserLabSessionResponse {
  sessionId: number;
  status: string;
  startAt: string;
  socketUrl: string;
}

interface ActiveSessionCheck {
  hasActiveSession: boolean;
  sessionId?: number;
  status?: string;
  startedAt?: string;
}

const StartLab: FC = () => {
  const { courseId, labId } = useParams<{ courseId: string; labId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);

  const [labDetail, setLabDetail] = useState<Lab | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [activeSession, setActiveSession] = useState<ActiveSessionCheck | null>(
    null,
  );
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!labId) {
      setPageError("Không tìm thấy ID của lab trong URL.");
      setIsPageLoading(false);
      return;
    }

    fetchData();
  }, [labId, user?.id]);

  const fetchData = async () => {
    try {
      const labResponse = await apiClient.get<Lab>(`/labs/${labId}`);
      setLabDetail(labResponse.data);

      if (user?.id) {
        const sessionResponse = await apiClient.get<ActiveSessionCheck>(
          `/lab-sessions/check-active/${labId}/${user.id}`,
        );
        setActiveSession(sessionResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setPageError(err.message || "Không thể tải thông tin lab.");
    } finally {
      setIsPageLoading(false);
      setIsCheckingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!activeSession?.sessionId) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/lab-sessions/${activeSession.sessionId}`);

      setActiveSession(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error deleting session:", err);
      alert(
        err.response?.data?.error ||
          "Không thể xóa phiên lab. Vui lòng thử lại.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartLab = async () => {
    if (!user || !user.id) {
      setStartError("Bạn cần đăng nhập để thực hiện bài Lab này.");
      return;
    }

    setIsStarting(true);
    setStartError(null);

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

      if (!sessionId) {
        throw new Error("Không nhận được Session ID từ server.");
      }

      if (!socketUrl) {
        throw new Error("Không nhận được Socket URL từ server.");
      }

      console.log("✅ Session created:", sessionId);
      console.log("🔌 Socket URL:", socketUrl);

      const urlWithToken = token
        ? `${socketUrl}${
            socketUrl.includes("?") ? "&" : "?"
          }token=${encodeURIComponent(token)}`
        : socketUrl;

      navigate(`/labs/${labId}/setup/${sessionId}`, {
        state: { socketUrl: urlWithToken },
      });
    } catch (err: any) {
      console.error("❌ Error starting lab:", err);

      if (err.response?.status === 409) {
        setStartError(
          err.response.data.error ||
            "Bạn đang có một phiên lab chưa hoàn thành.",
        );
      } else if (err.response?.status === 403) {
        setStartError("Bạn chưa đăng ký khóa học này.");
      } else if (err.response?.status === 404) {
        setStartError("Không tìm thấy thông tin lab.");
      } else {
        setStartError(
          err.response?.data?.error ||
            "Không thể khởi động lab. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isPageLoading || isCheckingSession) {
    return <LoadingScreen />;
  }

  if (pageError) {
    return <ErrorScreen error={pageError} onBack={handleCancel} />;
  }

  if (!labDetail) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-4">
      <div className="mx-auto max-w-4xl pt-8">
        <LabHeader
          labDetail={labDetail}
          activeSession={activeSession}
          onDeleteSession={handleDeleteSession}
          onStartLab={handleStartLab}
          onCancel={handleCancel}
          isDeleting={isDeleting}
          isStarting={isStarting}
          startError={startError}
        />
      </div>
    </div>
  );
};

export default StartLab;
