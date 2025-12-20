import { FC } from "react";

interface CourseMetadataProps {
  instructor?: string;
  duration?: string;
  studentsCount?: number;
  rating?: number;
  lastUpdated?: string;
  lifetimeAccess?: boolean;
}

export const CourseMetadata: FC<CourseMetadataProps> = ({
  instructor,
  duration,
  studentsCount,
  rating,
  lastUpdated,
  lifetimeAccess,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-6 text-sm text-gray-500">
      {instructor && (
        <div className="flex items-center gap-2">
          <span>👨‍🏫</span>
          <span>{instructor}</span>
        </div>
      )}
      {duration && (
        <div className="flex items-center gap-2">
          <span>⏱️</span>
          <span>{duration}</span>
        </div>
      )}
      {studentsCount !== undefined && (
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>{studentsCount.toLocaleString()} học viên</span>
        </div>
      )}
      {rating && (
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <span>{rating.toFixed(1)}</span>
        </div>
      )}
      {lastUpdated && (
        <div className="flex items-center gap-2">
          <span>🔄</span>
          <span>Cập nhật: {lastUpdated}</span>
        </div>
      )}
      {lifetimeAccess && (
        <div className="flex items-center gap-2">
          <span>♾️</span>
          <span>Truy cập trọn đời</span>
        </div>
      )}
    </div>
  );
};
