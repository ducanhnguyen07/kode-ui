import { CourseCurriculumTab } from "@/components/course/course-detail/course-curriculum-tab";
import { CourseInstructorTab } from "@/components/course/course-detail/course-instructor-tab";
import { CourseMetadata } from "@/components/course/course-detail/course-meta-data";
import { CourseOverviewTab } from "@/components/course/course-detail/course-overview-tab";
import { CourseSidebar } from "@/components/course/course-detail/course-sidebar";
import apiClient from "@/shared/api/apiClient";
import { Badge } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

interface Lab {
  id: number;
  title: string;
  short_description?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  order?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  level: string;
  labs: Lab[];
  duration?: string;
  students_count?: number;
  rating?: number;
  category?: string;
  instructor?: string;
  instructor_bio?: string;
  instructor_avatar?: string;
  last_updated?: string;
  language?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  price?: number;
  discount_price?: number;
  certificate?: boolean;
  lifetime_access?: boolean;
}

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
                {course.language && <Badge>🌐 {course.language}</Badge>}
                {course.certificate && <Badge>📜 Chứng chỉ</Badge>}
              </div>

              <h1 className="text-foreground mb-4 text-4xl font-bold">
                {course.title}
              </h1>

              <p className="mb-6 text-lg text-gray-600">
                {course.short_description}
              </p>

              <CourseMetadata
                instructor={course.instructor}
                duration={course.duration}
                studentsCount={course.students_count}
                rating={course.rating}
                lastUpdated={course.last_updated}
                lifetimeAccess={course.lifetime_access}
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
                    <CourseOverviewTab
                      description={course.description}
                      learningOutcomes={course.learning_outcomes}
                      prerequisites={course.prerequisites}
                    />
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
                    <CourseInstructorTab
                      instructor={course.instructor}
                      instructorBio={course.instructor_bio}
                      instructorAvatar={course.instructor_avatar}
                    />
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
                duration={course.duration}
                labsCount={course.labs.length}
                studentsCount={course.students_count}
                price={course.price}
                discountPrice={course.discount_price}
                language={course.language}
                certificate={course.certificate}
                lifetimeAccess={course.lifetime_access}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetailPage;
