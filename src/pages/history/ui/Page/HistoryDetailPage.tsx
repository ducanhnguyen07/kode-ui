import { FC, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Import useParams
import { CheckCircle,  Clock,  AlertCircle, Loader2, Trophy, FileText, ArrowLeft } from "lucide-react";
import apiClient from "@/shared/api/apiClient";

interface Submission {
  questionId: number;
  questionContent: string;
  userAnswerContent: string;
  submittedAt: string;
  correct: boolean;
}

interface SessionStatistic {
  sessionId: number;
  labTitle: string;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
  submissions: Submission[];
}

const HistoryDetailPage: FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>(); // Lấy ID từ URL
  const [data, setData] = useState<SessionStatistic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // Gọi API với sessionId động
        const response = await apiClient.get<SessionStatistic>(`/lab-sessions/${sessionId}/statistic`);
        setData(response.data);
      } catch (err: any) {
        console.error("Lỗi khi tải lịch sử:", err);
        setError(err.message || "Không thể tải dữ liệu chi tiết.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  // ... (Giữ nguyên các hàm helper render: formatDate, getStatusBadge)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") return <span className="badge badge-success gap-2 text-white"><CheckCircle size={14}/> Hoàn thành</span>;
    return <span className="badge badge-ghost gap-2 text-gray-600"><Clock size={14}/> {status}</span>;
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  
  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 mb-2 flex justify-center"><AlertCircle /></div>
        <p>{error}</p>
        <Link to="/history" className="btn btn-link mt-4">Quay lại danh sách</Link>
      </div>
    </div>
  );

  if (!data) return null;

  const scorePercentage = data.totalQuestions > 0 ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="container mx-auto max-w-5xl">
        
        {/* Breadcrumb / Back Button */}
        <div className="mb-6">
          <Link to="/history" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
          </Link>
        </div>

        {/* ... (Phần hiển thị Header và Table giống hệt code cũ, chỉ khác là data động) */}
        
        {/* Header Section */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{data.labTitle}</h1>
                {getStatusBadge(data.status)}
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <FileText size={14}/> Session ID: #{data.sessionId}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-blue-50 px-5 py-3 rounded-lg border border-blue-100">
              <div className={`p-3 rounded-full ${scorePercentage >= 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Kết quả</div>
                <div className="text-2xl font-bold text-gray-800">
                  {data.correctAnswers} <span className="text-sm text-gray-400 font-normal">/ {data.totalQuestions} câu đúng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Chi tiết câu trả lời</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="text-gray-500 font-medium text-xs uppercase bg-white border-b border-gray-100">
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th className="w-1/3">Câu hỏi</th>
                  <th className="w-1/3">Câu trả lời</th>
                  <th className="w-40">Thời gian</th>
                  <th className="text-right">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((sub, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                    <td className="text-center font-mono text-gray-400">{index + 1}</td>
                    <td>
                      <div className="font-medium text-gray-800 line-clamp-2" title={sub.questionContent}>{sub.questionContent}</div>
                    </td>
                    <td>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-mono break-all">{sub.userAnswerContent}</code>
                    </td>
                    <td className="text-gray-500 text-sm">{formatDate(sub.submittedAt)}</td>
                    <td className="text-right">
                      {sub.correct ? <span className="text-green-600 font-medium">Đúng</span> : <span className="text-red-500 font-medium">Sai</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoryDetailPage;