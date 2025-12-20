import { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  BookOpen, 
  Code, 
  Layers, 
  Loader2, 
  AlertCircle, 
  CalendarDays,
  ArrowRight
} from "lucide-react";
import apiClient from "@/shared/api/apiClient";

// --- 1. Định nghĩa Interface ---
interface Subject {
  id: number;
  title: string;
  description: string;
  code: string;
  isActive: boolean;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

const SubjectListPage: FC = () => {
  // --- 2. State Management ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 3. Fetch Data ---
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<Subject[]>("/subjects");
        setSubjects(response.data);
      } catch (err: any) {
        console.error("Lỗi khi tải danh sách môn học:", err);
        setError("Không thể tải danh sách môn học. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // --- 4. Filtering Logic ---
  const filteredSubjects = subjects.filter((subject) => {
    const term = searchTerm.toLowerCase();
    return (
      subject.title.toLowerCase().includes(term) ||
      subject.code.toLowerCase().includes(term)
    );
  });

  // --- 5. Helper Render ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span>Đang tải danh sách môn học...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BookOpen className="text-blue-600" /> 
            Danh sách môn học
          </h1>
          <p className="text-gray-500 mt-2">
            Khám phá các môn học và tham gia thực hành các bài Lab.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên môn học hoặc mã môn (ví dụ: IN)..." 
              className="input input-bordered w-full pl-10 focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        {error ? (
          <div className="rounded-xl bg-red-50 p-8 text-center text-red-600 border border-red-200">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h3 className="font-bold text-lg">Đã xảy ra lỗi</h3>
            <p>{error}</p>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Header: Color Stripe & Code */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top Meta: Code & Credits */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge badge-lg badge-ghost gap-1 font-mono font-bold text-gray-600 bg-gray-100">
                      <Code size={14} /> {subject.code}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <Layers size={14} /> {subject.credits} Tín chỉ
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                    {subject.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                    {subject.description || "Chưa có mô tả cho môn học này."}
                  </p>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-100 my-3"></div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-gray-400 flex items-center gap-1" title="Ngày cập nhật">
                      <CalendarDays size={14}/> {new Date(subject.updatedAt).toLocaleDateString('vi-VN')}
                    </div>
                    
                    <Link 
                      to={`/courses?subjectId=${subject.id}`} 
                      className="btn btn-sm btn-ghost gap-2 text-blue-600 hover:bg-blue-50"
                    >
                      Chi tiết <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectListPage;