import { FC } from "react";
import { TiptapViewer } from "./tip-tap-viewer";

interface CourseInstructorTabProps {
  instructor?: string;
  instructorBio?: string;
  instructorAvatar?: string;
}

const Card: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`rounded-lg border bg-white p-4 ${className}`}>
    {children}
  </div>
);

export const CourseInstructorTab: FC<CourseInstructorTabProps> = ({
  instructor,
  instructorBio,
  instructorAvatar,
}) => {
  if (!instructor) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        {instructorAvatar && (
          <img
            src={instructorAvatar}
            alt={instructor}
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="mb-2 text-2xl font-semibold">{instructor}</h3>
          {instructorBio && <TiptapViewer content={instructorBio} />}
        </div>
      </div>
    </Card>
  );
};
