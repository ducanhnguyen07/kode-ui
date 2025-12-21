import { FC } from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="mb-8">
      <Progress value={progress} className="mb-4 h-2" />
      <div className="text-center">
        <span className="text-sm font-medium text-cyan-600">{progress}%</span>
      </div>
    </div>
  );
};
