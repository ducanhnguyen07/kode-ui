import { FC } from "react";
import { LabDetailCard } from "./lab-detail-card";
import { Lab } from "@/types/lab";

interface CourseCurriculumTabProps {
  labs: Lab[];
  courseId: number;
}

export const CourseCurriculumTab: FC<CourseCurriculumTabProps> = ({
  labs,
  courseId,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="border-b p-4">
          <h3 className="text-xl font-semibold">
            Nội dung khóa học ({labs.length} bài lab)
          </h3>
        </div>
        <div>
          {labs.map((lab, index) => (
            <LabDetailCard
              key={lab.id}
              lab={lab}
              courseId={courseId}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
