import { FC } from "react";

interface SetupOverlayProps {
  show: boolean;
  progress: number;
  status: string;
}

export const SetupOverlay: FC<SetupOverlayProps> = ({
  show,
  progress,
  status,
}) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90">
      <div className="text-center text-white">
        <div className="mb-4 text-xl font-semibold">
          {status === "waiting"
            ? "Initializing..."
            : "Creating Lab Environment"}
        </div>
        <div className="mb-2">Progress: {progress}%</div>
        <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Setting up your virtual environment...
        </div>
      </div>
    </div>
  );
};
