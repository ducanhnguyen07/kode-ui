import apiClient from "@/shared/api/apiClient";
import { Course } from "@/types/course";
import { Badge } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CourseCurriculumTab } from "../components/course-curriculum-tab";
import { CourseLecturerTab } from "../components/course-lecture-tab";
import { CourseMetadata } from "../components/course-meta-data";
import { CourseOverviewTab } from "../components/course-overview-tab";
import { CourseSidebar } from "../components/course-sidebar";

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

const Tabs: FC<{
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
  onValueChange?: (value: string) => void;
}> = ({ children }) => <div>{children}</div>;

const TabsList: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`flex gap-2 border-b ${className}`}>{children}</div>;

const TabsTrigger: FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => (
  <button className={`px-4 py-2 ${className}`} onClick={onClick}>
    {children}
  </button>
);

const TabsContent: FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, className }) => <div className={className}>{children}</div>;

const CourseDetailPage: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (!courseId) {
      setError("ID của khóa học không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/courses/${courseId}/detail`;
        const response = await apiClient.get<Course>(url);
        setCourse(response.data);
        // console.log("Dữ liệu khóa học đã được tải:", response.data);
      } catch (err: any) {
        console.error("Lỗi khi fetch dữ liệu khóa học:", err);
        const serverMessage = err.response?.data?.message || err.message;
        setError(serverMessage || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-12 text-center text-lg font-semibold">
          Đang tải dữ liệu khóa học...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-12 text-center text-lg text-red-600">
          Lỗi: {error}
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto p-12 text-center">
          Không có dữ liệu để hiển thị.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="to-background bg-gradient-to-r from-blue-50/10 via-blue-50/5 p-5">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* CỘT BÊN TRÁI */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <Badge>{course.level}</Badge>
                {course.category && <Badge>{course.category}</Badge>}
              </div>

              <h1 className="text-foreground mb-4 text-4xl font-bold">
                {course.title}
              </h1>

              <p className="mb-6 text-lg text-gray-600">
                {course.short_description}
              </p>

              <CourseMetadata
                lecturer={course.lecturer}
                studentsCount={course.studentsCount}
                updatedAt={course.updatedAt}
              />

              <Tabs
                defaultValue="overview"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-6">
                  <TabsTrigger
                    value="overview"
                    className={
                      activeTab === "overview"
                        ? "border-b-2 border-blue-600 font-semibold"
                        : ""
                    }
                    onClick={() => setActiveTab("overview")}
                  >
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className={
                      activeTab === "curriculum"
                        ? "border-b-2 border-blue-600 font-semibold"
                        : ""
                    }
                    onClick={() => setActiveTab("curriculum")}
                  >
                    Nội dung khóa học
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className={
                      activeTab === "instructor"
                        ? "border-b-2 border-blue-600 font-semibold"
                        : ""
                    }
                    onClick={() => setActiveTab("instructor")}
                  >
                    Giảng viên
                  </TabsTrigger>
                </TabsList>

                {activeTab === "overview" && (
                  <TabsContent value="overview" className="mt-2">
                    <CourseOverviewTab description={course.description} />
                  </TabsContent>
                )}

                {activeTab === "curriculum" && (
                  <TabsContent value="curriculum" className="mt-2">
                    <CourseCurriculumTab
                      labs={course.labs}
                      courseId={course.id}
                    />
                  </TabsContent>
                )}

                {activeTab === "instructor" && (
                  <TabsContent value="instructor" className="mt-2">
                    <CourseLecturerTab lecturer={course.lecturer} />
                  </TabsContent>
                )}
              </Tabs>
            </div>

            {/* CỘT BÊN PHẢI */}
            <div className="lg:col-span-1">
              <CourseSidebar
                title={course.title}
                category={course.category}
                level={course.level}
                labsCount={course.labs.length}
                studentsCount={course.studentsCount}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetailPage;
