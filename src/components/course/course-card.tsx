// components/CourseCard.tsx
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  id: number;
  title: string;
  shortDescription?: string;
  level?: string;
  updatedAt?: string;
  subjectTitle?: string;
}

const CourseCard: FC<CourseCardProps> = ({
  id,
  title,
  shortDescription,
  level,
  updatedAt,
  subjectTitle,
}) => {
  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getLevelVariant = (level?: string) => {
    const normalized = level?.trim().toLowerCase();
    if (normalized?.includes("cơ bản")) {
      return "default";
    }
    if (normalized?.includes("trung cấp")) {
      return "secondary";
    }
    if (normalized?.includes("nâng cao")) {
      return "destructive";
    }
    return "outline";
  };

  return (
    <Link to={`/courses/${id}`} className="group block h-full">
      <Card className="h-full rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={getLevelVariant(level)} className="text-xs">
              {level || "Tất cả cấp độ"}
            </Badge>
            {updatedAt && (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatDate(updatedAt)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="line-clamp-2 text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
              {title}
            </h3>
            {shortDescription && (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {shortDescription}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between border-t pt-4">
            {subjectTitle ? (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{subjectTitle}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Khóa học</span>
            )}

            <div className="flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
              <span>Chi tiết</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
