import {
  Clock,
  FlaskConical,
  AlertTriangle,
  Trash2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { FC } from "react";
import { Lab } from "@/types/lab";

interface LabHeaderProps {
  labDetail: Lab;
  activeSession: {
    hasActiveSession: boolean;
    sessionId?: number;
    status?: string;
  } | null;
  onDeleteSession: () => void;
  onStartLab: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  isStarting: boolean;
  startError: string | null;
}

export const LabHeader: FC<LabHeaderProps> = ({
  labDetail,
  activeSession,
  onDeleteSession,
  onStartLab,
  onCancel,
  isDeleting,
  isStarting,
  startError,
}) => {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
      {/* Lab Info Section */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-2.5">
            <FlaskConical className="h-6 w-6 text-cyan-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {labDetail.title}
          </h1>
        </div>
        <p className="leading-relaxed text-gray-600">{labDetail.description}</p>
      </div>

      {/* Time Info */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 rounded-lg border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-3">
          <div className="rounded-full bg-white p-2 shadow-sm">
            <Clock className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Thời gian ước tính
            </p>
            <p className="text-lg font-bold text-gray-800">
              {labDetail.estimatedTime} phút
            </p>
          </div>
        </div>
      </div>

      {/* Active Session Warning */}
      {activeSession?.hasActiveSession && (
        <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-1.5">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-bold text-red-800">
                Bạn đang có phiên bài thực hành chưa hoàn thành
              </h3>
              <p className="text-sm text-red-700">
                Trạng thái:{" "}
                <span className="font-semibold">{activeSession.status}</span>.
                Vui lòng xóa phiên hiện tại để tạo phiên mới.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="my-6 border-t border-gray-100"></div>

      {/* Action Section */}
      <div>
        {/* Error Display */}
        {startError && !activeSession?.hasActiveSession && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-red-700">{startError}</p>
          </div>
        )}

        {/* Action Button */}
        {activeSession?.hasActiveSession ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={onDeleteSession}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Xóa phiên
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={onStartLab}
              disabled={isStarting}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-cyan-500 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-center gap-2">
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang khởi tạo...
                  </>
                ) : (
                  <>
                    Bắt đầu bài thực hành
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
