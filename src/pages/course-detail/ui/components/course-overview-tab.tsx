import { FC } from "react";
import { TiptapViewer } from "./tip-tap-viewer";

interface CourseOverviewTabProps {
  description: string;
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
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-4 text-xl font-semibold">Mô tả khóa học</h3>
        <TiptapViewer content={description} />
      </Card>
    </div>
  );
};
