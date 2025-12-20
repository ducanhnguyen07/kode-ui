import { FC } from "react";
import { TiptapViewer } from "./tip-tap-viewer";

interface CourseOverviewTabProps {
  description: string;
  learningOutcomes?: string[];
  prerequisites?: string[];
}

const Card: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`rounded-lg border bg-white p-4 ${className}`}>
    {children}
  </div>
);

export const CourseOverviewTab: FC<CourseOverviewTabProps> = ({
  description,
  learningOutcomes,
  prerequisites,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-4 text-xl font-semibold">Mô tả khóa học</h3>
        <TiptapViewer content={description} />
      </Card>

      {learningOutcomes && learningOutcomes.length > 0 && (
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Bạn sẽ học được gì</h3>
          <ul className="space-y-2">
            {learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {prerequisites && prerequisites.length > 0 && (
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Yêu cầu</h3>
          <ul className="space-y-2">
            {prerequisites.map((prerequisite, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>{prerequisite}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
