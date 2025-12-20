// components/course-detail/LabDetailCard.tsx
import { FC, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "./badge";
import { TiptapViewer } from "./tip-tap-viewer";

interface Lab {
  id: number;
  title: string;
  short_description?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  order?: number;
}

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
          <p className="font-medium">{lab.title}</p>
          {lab.short_description && (
            <p className="text-sm text-gray-500">{lab.short_description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lab.duration && (
            <span className="text-sm text-gray-500">⏱️ {lab.duration}</span>
          )}
          {lab.difficulty && <Badge variant="outline">{lab.difficulty}</Badge>}
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {isExpanded && lab.description && (
        <div className="border-t bg-gray-50 p-6">
          <TiptapViewer content={lab.description} />
          <Link
            to={`/courses/${courseId}/labs/${lab.id}/start`}
            className="mt-4 inline-block"
          >
            <Button size="sm">Bắt đầu lab này</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
