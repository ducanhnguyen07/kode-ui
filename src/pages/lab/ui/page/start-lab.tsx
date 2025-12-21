// src/pages/Lab/ui/Page/StartLab.tsx
import { useAppSelector } from "@/app/hooks";
import apiClient from "@/shared/api/apiClient";
import { Lab } from "@/types/lab";
import {
  AlertCircle,
  ChevronRight,
  Loader2,
  FlaskConical,
  X,
  Clock,
  BookOpen,
} from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface UserLabSessionResponse {
  sessionId: number;
  status: string;
  startAt: string;
  socketUrl: string;
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

  useEffect(() => {
    if (!labId) {
      setPageError("Không tìm thấy ID của lab trong URL.");
      setIsPageLoading(false);
      return;
    }

    const fetchLabDetails = async () => {
      try {
        const response = await apiClient.get<Lab>(`/labs/${labId}`);
        setLabDetail(response.data);
      } catch (err: any) {
        console.error("Error fetching lab details:", err);
        setPageError(err.message || "Không thể tải thông tin lab.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchLabDetails();
  }, [labId]);

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

      // Thêm token vào socketUrl
      const urlWithToken = token
        ? `${socketUrl}${
            socketUrl.includes("?") ? "&" : "?"
          }token=${encodeURIComponent(token)}`
        : socketUrl;

      navigate(`/labs/${labId}/setup/${sessionId}`, {
        state: { socketUrl: urlWithToken },
      });
    } catch (err: any) {
      console.error("❌ Start lab error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Không thể khởi tạo Lab.";
      setStartError(message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-600">{pageError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <FlaskConical className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {labDetail?.title}
          </h1>
          <p className="text-sm text-gray-600">
            Bạn đã sẵn sàng để bắt đầu bài thực hành này?
          </p>
        </div>

        {labDetail && (
          <div className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4">
            {labDetail.estimatedTime && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Thời gian ước tính: {labDetail.estimatedTime} phút</span>
              </div>
            )}
          </div>
        )}

        {startError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{startError}</p>
          </div>
        )}

        <div className="flex w-full gap-3">
          <button
            onClick={handleCancel}
            disabled={isStarting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>Hủy</span>
          </button>

          <button
            onClick={handleStartLab}
            disabled={isStarting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="whitespace-nowrap">Đang khởi tạo...</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Bắt đầu bài thực hành</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartLab;
