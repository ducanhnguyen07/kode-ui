import { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Hash
} from "lucide-react";
import apiClient from "@/shared/api/apiClient";

// --- 1. Định nghĩa Interface theo API Response ---
interface HistorySession {
  sessionId: number;
  labTitle: string;
  status: string; // "COMPLETED", v.v.
  startAt: string;
  completedAt: string | null;
}

interface HistoryResponse {
  totalItems: number;
  data: HistorySession[];
  totalPages: number;
  currentPage: number;
}

const HistoryListPage: FC = () => {
  // --- 2. State Management ---
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho tìm kiếm & phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // --- 3. Fetch Data ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // Gọi API endpoint mới
        const response = await apiClient.get<HistoryResponse>("/lab-sessions/history");
        
        // Cập nhật data và thông tin phân trang
        setSessions(response.data.data);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems
        });
      } catch (err: any) {
        console.error("Lỗi tải lịch sử:", err);
        setError("Không thể tải danh sách bài thực hành.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // --- 4. Helper Functions ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge badge-success gap-1 text-white"><CheckCircle size={12}/> Hoàn thành</span>;
      case "FAILED":
        return <span className="badge badge-error gap-1 text-white"><XCircle size={12}/> Thất bại</span>;
      default:
        return <span className="badge badge-warning gap-1 text-white"><PlayCircle size={12}/> Đang thực hiện</span>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Lọc client-side đơn giản theo tên bài Lab
  const filteredSessions = sessions.filter(s => 
    s.labTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 5. Render ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="container mx-auto max-w-4xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Lịch sử thực hành</h1>
          <p className="text-gray-500 mt-2">
            Tổng cộng: {pagination.totalItems} bài thực hành
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên bài Lab..." 
              className="input input-bordered w-full pl-10 focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-red-500 flex flex-col items-center">
              <AlertCircle className="mb-2 h-8 w-8"/> 
              <span>{error}</span>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredSessions.map((session) => (
                <Link 
                  to={`/history/${session.sessionId}`} 
                  key={session.sessionId}
                  className="flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                        {session.labTitle}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Hash size={14} className="text-gray-400"/> 
                        Session ID: {session.sessionId}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PlayCircle size={14} className="text-gray-400"/> 
                        Bắt đầu: {formatDate(session.startAt)}
                      </span>
                      {session.completedAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400"/> 
                          Kết thúc: {formatDate(session.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pl-4">
                    <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors h-6 w-6" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>Chưa tìm thấy lịch sử thực hành nào.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls (Nếu cần sau này) */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm">Trang {pagination.currentPage} / {pagination.totalPages}</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryListPage;