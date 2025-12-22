import { Loader2 } from "lucide-react";
import { FC } from "react";

export const LoadingScreen: FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 opacity-20 blur-xl"></div>
          </div>
          <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-cyan-500" />
        </div>
        <p className="mt-6 text-sm font-medium text-gray-600">
          Đang tải thông tin lab...
        </p>
      </div>
    </div>
  );
};
