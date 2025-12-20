import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TiptapViewer } from "./tip-tap-viewer";
import { Lab } from "@/types/lab";

interface LabDetailCardProps {
  lab: Lab;
  courseId: number;
  index: number;
}

const FlaskConical: FC<{ className?: string }> = ({ className }) => (
  <span className={className}>🧪</span>
);

export const LabDetailCard: FC<LabDetailCardProps> = ({
  lab,
  courseId,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <div
        className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
          {index + 1}
        </div>
        <FlaskConical className="text-blue-500" />
        <div className="flex-1">
          <h3 className="font-medium">{lab.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {lab.estimatedTime && (
            <span className="text-sm text-gray-500">
              ⏱️ {lab.estimatedTime} phút
            </span>
          )}
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t bg-gray-50 p-6">
          {lab.description && <TiptapViewer content={lab.description} />}

          <Link
            to={`/courses/${courseId}/labs/${lab.id}/start`}
            className="inline-block"
          >
            <Button size="sm">Bắt đầu làm bài thực hành</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
