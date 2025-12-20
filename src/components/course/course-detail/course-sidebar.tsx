import { FC } from "react";

import { Button } from "@/components/ui/button";
import { CourseIcon } from "./course-icon";

interface CourseSidebarProps {
  title: string;
  category?: string;
  level: string;
  labsCount: number;
  studentsCount?: number;
}

export const CourseSidebar: FC<CourseSidebarProps> = ({
  title,
  category,
  level,
  labsCount,
  studentsCount,
}) => {
  return (
    <div className="bg-card sticky top-4 overflow-hidden rounded-lg border shadow-lg">
      <CourseIcon title={title} category={category} />
      <div className="p-6">
        <Button className="w-full" size="lg">
          Bắt đầu học
        </Button>
        <div className="mt-4 space-y-3 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cấp độ:</span>
            <span className="font-semibold">{level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số bài thực hành:</span>
            <span className="font-semibold">{labsCount}</span>
          </div>
          {studentsCount !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Học viên:</span>
              <span className="font-semibold">
                {studentsCount.toLocaleString()}
              </span>
            </div>
          )}
          {category !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Danh mục:</span>
              <span className="font-semibold">{category}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
