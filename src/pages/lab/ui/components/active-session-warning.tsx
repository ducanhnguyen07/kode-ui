import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { FC } from "react";

interface ActiveSessionWarningProps {
  status: string;
  onDelete: () => void;
  isDeleting: boolean;
}

export const ActiveSessionWarning: FC<ActiveSessionWarningProps> = ({
  status,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="mb-8 rounded-2xl border-2 border-red-200 bg-red-50 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-100 p-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-bold text-red-800">
            Bạn đang có phiên lab chưa hoàn thành
          </h3>
          <p className="mb-4 text-sm text-red-700">
            Bạn đã có một phiên thực hành đang hoạt động (Trạng thái:{" "}
            <span className="font-semibold">{status}</span>). Vui lòng xóa phiên
            hiện tại trước khi tạo phiên mới.
          </p>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Xóa phiên lab hiện tại
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
