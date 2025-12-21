import { FC } from "react";
import { User } from "@/types/user";

interface CourseInstructorTabProps {
  lecturer?: User;
}

const Card: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`rounded-lg border bg-white p-4 ${className}`}>
    {children}
  </div>
);

export const CourseLecturerTab: FC<CourseInstructorTabProps> = ({
  lecturer,
}) => {
  if (!lecturer) {
    return null;
  }

  return (
    <Card>
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold">
          {lecturer.lastName + " " + lecturer.firstName}
        </h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-medium">Username:</span>
            <span>{lecturer.username}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium">Email:</span>
            <span>{lecturer.email}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium">Phone:</span>
            <span>{lecturer.phoneNumber}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
