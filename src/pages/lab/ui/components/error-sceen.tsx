import { AlertCircle } from "lucide-react";
import { FC } from "react";

interface ErrorScreenProps {
  error: string;
  onBack: () => void;
}

export const ErrorScreen: FC<ErrorScreenProps> = ({ error, onBack }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full border border-red-100 bg-red-50 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-xl font-bold text-gray-800">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-600">
          {error}
        </p>
        <button
          onClick={onBack}
          className="w-full rounded-lg border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:from-gray-200 hover:to-gray-300"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};
