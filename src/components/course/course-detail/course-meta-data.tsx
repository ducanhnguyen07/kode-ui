import { User } from "@/types/user";
import { FC } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
interface CourseMetadataProps {
  lecturer?: User;
  studentsCount?: number;
  updatedAt?: string;
}

export const CourseMetadata: FC<CourseMetadataProps> = ({
  lecturer,
  studentsCount,
  updatedAt,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-6 text-sm text-gray-500">
      {lecturer && (
        <div className="flex items-center gap-2">
          <span>👨‍🏫</span>
          <span>{lecturer.lastName + " " + lecturer.firstName}</span>
        </div>
      )}

      {studentsCount !== undefined && (
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>{studentsCount} học viên</span>
        </div>
      )}

      {updatedAt && (
        <div className="flex items-center gap-2">
          <span>🔄</span>
          <span>
            Cập nhật:{" "}
            {format(new Date(updatedAt), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
      )}
    </div>
  );
};
