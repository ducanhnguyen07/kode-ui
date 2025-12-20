import { FC } from "react";

import { Button } from "@/components/ui/button";
import { CourseIcon } from "./course-icon";

interface CourseSidebarProps {
  title: string;
  category?: string;
  level: string;
  duration?: string;
  labsCount: number;
  studentsCount?: number;
  price?: number;
  discountPrice?: number;
  language?: string;
  certificate?: boolean;
  lifetimeAccess?: boolean;
}

export const CourseSidebar: FC<CourseSidebarProps> = ({
  title,
  category,
  level,
  duration,
  labsCount,
  studentsCount,
  price,
  discountPrice,
  language,
  certificate,
  lifetimeAccess,
}) => {
  return (
    <div className="bg-card sticky top-4 overflow-hidden rounded-lg border shadow-lg">
      <CourseIcon title={title} category={category} />
      <div className="p-6">
        {price !== undefined && (
          <div className="mb-4 text-center">
            {discountPrice !== undefined && discountPrice < price ? (
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {discountPrice.toLocaleString("vi-VN")} ₫
                </span>
                <span className="ml-2 text-lg text-gray-400 line-through">
                  {price.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            ) : price === 0 ? (
              <span className="text-2xl font-bold text-green-600">
                Miễn phí
              </span>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {price.toLocaleString("vi-VN")} ₫
              </span>
            )}
          </div>
        )}
        <Button className="w-full" size="lg">
          Bắt đầu học
        </Button>
        <div className="mt-4 space-y-3 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cấp độ:</span>
            <span className="font-semibold">{level}</span>
          </div>
          {duration && (
            <div className="flex justify-between">
              <span className="text-gray-600">Thời lượng:</span>
              <span className="font-semibold">{duration}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Số bài lab:</span>
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
          {language && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngôn ngữ:</span>
              <span className="font-semibold">{language}</span>
            </div>
          )}
          {certificate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Chứng chỉ:</span>
              <span className="font-semibold text-green-600">Có</span>
            </div>
          )}
          {lifetimeAccess && (
            <div className="flex justify-between">
              <span className="text-gray-600">Truy cập:</span>
              <span className="font-semibold">Trọn đời</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
