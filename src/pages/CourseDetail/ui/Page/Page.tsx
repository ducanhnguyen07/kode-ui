import apiClient from "@/shared/api/apiClient";
import React, { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// --- Các UI Component (giữ nguyên) ---
const Button: FC<{
  children: React.ReactNode;
  className?: string;
  size?: string;
}> = ({ children, className }) => (
  <button
    className={`rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${className}`}
  >
    {children}
  </button>
);
const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
const Tabs: FC<{
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}> = ({ children }) => <div>{children}</div>;
const TabsContent: FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, className }) => <div className={className}>{children}</div>;
const FlaskConical: FC<{ className?: string }> = ({ className }) => (
  <span className={className}>🧪</span>
);

// --- Định nghĩa Types (giữ nguyên) ---
interface Lab {
  id: number;
  title: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  labs: Lab[];
}

// --- Component chính ---
const CourseDetailPage: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        // SỬA: Dùng path tương đối, không cần http://localhost... vì đã có baseURL trong apiClient
        const url = `/courses/${courseId}/detail`;
        
        // SỬA: Gọi qua apiClient và nhận response kiểu AxiosResponse<Course>
        const response = await apiClient.get<Course>(url);

        // Axios tự động parse JSON và đưa vào response.data
        // Nếu API trả về lỗi (4xx, 5xx), axios sẽ nhảy xuống catch, không cần check !response.ok
        setCourse(response.data);
        
      } catch (err: any) {
        console.error("Lỗi khi fetch dữ liệu khóa học:", err);
        
        // Xử lý lỗi từ Axios (err.response chứa thông tin lỗi từ server trả về nếu có)
        const serverMessage = err.response?.data?.message || err.message;
        setError(serverMessage || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // --- Các phần render UI (giữ nguyên) ---
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
            {/* --- CỘT BÊN TRÁI (2/3 CHIỀU RỘNG) --- */}
            <div className="lg:col-span-2">
              <h1 className="text-foreground mb-4 text-4xl font-bold">
                {course.title}
              </h1>
              <div
                className="mb-6 text-lg text-gray-500"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
              <Tabs defaultValue="curriculum" className="w-full">
                <TabsContent value="curriculum" className="mt-2">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border">
                      <div className="p-4">
                        <h3 className="text-xl font-semibold">
                          Nội dung khóa học
                        </h3>
                      </div>
                      <div className="divide-y">
                        {course.labs.map((lab) => (
                          <Link
                            key={lab.id}
                            to={`/courses/${course.id}/labs/${lab.id}/start`}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50"
                          >
                            <FlaskConical className="text-blue-500" />
                            <p>{lab.title}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* --- CỘT BÊN PHẢI (1/3 CHIỀU RỘNG) --- */}
            <div className="lg:col-span-1">
              <div className="bg-card sticky top-4 overflow-hidden rounded-lg border shadow-lg">
                <img
                  src={
                    "https://images.viblo.asia/fad7cf1a-772f-43e4-9042-e96d5d903b2b.png"
                  }
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <Button className="w-full" size="lg">
                    Bắt đầu học
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetailPage;