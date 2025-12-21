import React, { FC, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react";
import apiClient from "@/shared/api/apiClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseCard from "@/pages/course-list-page/ui/component/course-card";

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

interface Course {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  level: string;
  updatedAt: string;
  isActive: boolean;
  subject?: {
    id: number;
    title: string;
    code: string;
  };
}

interface SubjectInfo {
  id: number;
  title: string;
  code: string;
}

interface ApiResponse {
  data: Course[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const CoursesListPage: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const code = searchParams.get("code");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 9;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (subjectId) {
          try {
            const subjectRes = await apiClient.get<SubjectInfo>(
              `/subjects/${subjectId}`,
            );
            setSubjectInfo(subjectRes.data);
          } catch (err) {
            console.error("Không tìm thấy môn học", err);
            setSubjectInfo(null);
          }
        } else {
          setSubjectInfo(null);
        }

        const params: any = {
          page: currentPage,
          pageSize: PAGE_SIZE,
        };

        if (searchTerm) params.search = searchTerm;
        if (code) params.code = code;
        if (selectedLevel !== "All") params.level = selectedLevel;

        const response = await apiClient.get<ApiResponse>("/courses", {
          params,
        });

        setCourses(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      } catch (err: any) {
        setError("Không thể tải dữ liệu khóa học.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId, code, currentPage, searchTerm, selectedLevel]);

  const uniqueLevels = useMemo(
    () => ["All", ...new Set(courses.map((c) => c.level).filter(Boolean))],
    [courses],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, subjectId, code]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearSubjectFilter = () => {
    setSearchParams({});
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLevel("All");
    if (subjectId) clearSubjectFilter();
  };

  const hasActiveFilters = searchTerm || selectedLevel !== "All" || subjectId;

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>,
      );
      if (startPage > 2) {
        buttons.push(
          <span
            key="dots1"
            className="text-muted-foreground flex h-10 w-10 items-center justify-center"
          >
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="dots2"
            className="text-muted-foreground flex h-10 w-10 items-center justify-center"
          >
            ...
          </span>,
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>,
      );
    }

    return buttons;
  };

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Subject Filter Banner */}
          {subjectId && subjectInfo && (
            <Alert className="mb-6 border-primary/50 bg-primary/5">
              <AlertTitle className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Đang lọc theo môn học
                  </div>
                  <div className="text-xl font-bold">{subjectInfo.title}</div>
                </div>
                <Button
                  onClick={clearSubjectFilter}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Xóa lọc
                </Button>
              </AlertTitle>
              <AlertDescription className="mt-2">
                Mã môn: <Badge variant="secondary">{subjectInfo.code}</Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Search & Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Tìm kiếm khóa học..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Level Filter */}
                  <div className="flex gap-3">
                    <Select
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueLevels.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl === "All" ? "Tất cả cấp độ" : lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <Button
                        onClick={clearAllFilters}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {isLoading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Đang tải khóa học...
              </p>
            </div>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="flex min-h-[400px] flex-col items-center justify-center"
            >
              <AlertTriangle className="mb-4 h-12 w-12" />
              <AlertTitle className="mb-2 text-lg">Đã xảy ra lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && (
            <>
              {courses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      shortDescription={course.shortDescription}
                      level={course.level}
                      updatedAt={course.updatedAt}
                      subjectTitle={course.subject?.title}
                    />
                  ))}
                </div>
              ) : (
                <Card className="flex min-h-[400px] flex-col items-center justify-center border-dashed">
                  <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
                    <Search className="text-muted-foreground/50 h-16 w-16" />
                    <div className="space-y-2 text-center">
                      <p className="text-xl font-semibold">
                        Không tìm thấy khóa học nào
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {subjectId
                          ? "Môn học này hiện chưa có khóa học nào."
                          : "Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm"}
                      </p>
                    </div>
                    <Button onClick={clearAllFilters} variant="outline">
                      Xem tất cả khóa học
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {renderPaginationButtons()}

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CoursesListPage;
