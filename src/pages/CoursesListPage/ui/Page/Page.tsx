import React, { FC, useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom"; // Thêm useSearchParams
import { 
  Loader2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  BookOpen, // Icon cho môn học
} from "lucide-react";
import apiClient from "@/shared/api/apiClient"; // Sử dụng apiClient chuẩn

// --- COMPONENTS HELPER ---
const Button: FC<{ children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean }> = ({
  children, className, onClick, disabled
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`rounded px-4 py-2 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const Badge: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`rounded p-1 px-2 text-xs ${className}`}>{children}</span>
);

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// --- TYPES ---
interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  level: string;
  price: string;
}

interface SubjectInfo {
  id: number;
  title: string;
  code: string;
}

const ITEMS_PER_PAGE = 6;

const CoursesListPage: FC = () => {
  // --- STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null); // State lưu thông tin môn học
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- ROUTER PARAMS ---
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId"); // Lấy ID môn học từ URL

  // --- FILTER & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Nếu có subjectId, gọi API lấy thông tin môn học để hiển thị tiêu đề
        if (subjectId) {
          try {
            const subjectRes = await apiClient.get<SubjectInfo>(`/subjects/${subjectId}`);
            setSubjectInfo(subjectRes.data);
          } catch (err) {
            console.error("Không tìm thấy môn học", err);
            // Không block luồng chính nếu lỗi lấy tên môn, chỉ cần null
            setSubjectInfo(null);
          }
        } else {
          setSubjectInfo(null);
        }

        // 2. Gọi API lấy danh sách khóa học
        // Truyền params subjectId nếu có để Backend lọc (nếu backend hỗ trợ)
        // Hoặc lấy tất cả về rồi lọc client (như code cũ đang làm)
        const params = subjectId ? { subjectId } : {};
        const response = await apiClient.get(`/courses?subject=${subjectId}`, { params });

        // Mapping dữ liệu
        // Lưu ý: response.data có thể là mảng trực tiếp hoặc object { data: [] } tùy backend
        // Giả sử API trả về { data: [...] } giống code cũ của bạn
        const rawData = response.data.data || response.data; // Fallback an toàn
        
        const mappedCourses = Array.isArray(rawData) ? rawData.map((apiCourse: any): Course => ({
          id: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description || "",
          level: apiCourse.level || "Mọi cấp độ",
          category: apiCourse.category || "Chưa phân loại",
          image: apiCourse.image || "https://images.viblo.asia/e60190b9-574c-4144-9eb0-8d3a54d3cd6a.png",
          price: "Miễn phí",
        })) : [];

        setCourses(mappedCourses);
      } catch (err: any) {
        setError("Không thể tải dữ liệu khóa học.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId]); // Chạy lại khi subjectId thay đổi

  // --- FILTER LOGIC (Client-side) ---
  const uniqueCategories = useMemo(() => ["All", ...new Set(courses.map(c => c.category))], [courses]);
  const uniqueLevels = useMemo(() => ["All", ...new Set(courses.map(c => c.level))], [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel, subjectId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hàm xóa filter môn học
  const clearSubjectFilter = () => {
    setSearchParams({}); // Xóa query params trên URL
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 pb-12 pt-8">

          {/* --- SUBJECT CONTEXT HEADER --- */}
          {/* Hiển thị Banner nếu đang lọc theo môn học */}
          {subjectId && subjectInfo && (
            <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white shadow-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-1 uppercase font-semibold tracking-wider">
                  <BookOpen size={16}/> Môn học hiện tại
                </div>
                <h2 className="text-3xl font-bold">{subjectInfo.title}</h2>
                <p className="text-blue-100 mt-1">Mã môn: <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white">{subjectInfo.code}</span></p>
              </div>
            </div>
          )}

          {/* --- TOOLBAR --- */}
          <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select 
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'Tất cả danh mục' : cat}</option>
                  ))}
                </select>
              </div>
              <div className="relative min-w-[150px]">
                <select 
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 px-4 text-sm outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-50"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {uniqueLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl === 'All' ? 'Mọi cấp độ' : lvl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* --- LIST CONTENT --- */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="mt-4 text-lg">Đang tải danh sách khóa học...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertTriangle className="h-12 w-12" />
              <p className="mt-4 text-lg font-semibold">Đã xảy ra lỗi</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filteredCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="bg-card group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute right-3 top-3 flex gap-2">
                          <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">
                            {course.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className="bg-gray-100 text-gray-600">{course.level}</Badge>
                        </div>
                        <h3 className="text-foreground mb-2 text-xl font-bold line-clamp-1 group-hover:text-blue-600">
                          {course.title}
                        </h3>
                        <div
                          className="mb-4 line-clamp-2 text-sm text-gray-500"
                          dangerouslySetInnerHTML={{ __html: course.description }}
                        />
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-lg font-bold text-blue-600">
                            {course.price}
                          </span>
                          <span className="text-sm font-medium text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                            Xem chi tiết &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <Search className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl font-semibold">Không tìm thấy khóa học nào</p>
                  <p className="text-sm">
                    {subjectId 
                      ? "Môn học này hiện chưa có khóa học nào." 
                      : "Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn"}
                  </p>
                  <button 
                    onClick={() => {
                      setSearchTerm(""); 
                      setSelectedCategory("All"); 
                      setSelectedLevel("All");
                      if (subjectId) clearSubjectFilter(); // Cho phép quay về xem tất cả
                    }}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Xem tất cả khóa học
                  </button>
                </div>
              )}

              {/* --- PAGINATION --- */}
              {filteredCourses.length > ITEMS_PER_PAGE && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" /> Trước
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    Sau <ChevronRight className="h-4 w-4" />
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