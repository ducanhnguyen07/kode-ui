import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Console from "./console";
import { Question, QuestionProps } from "./question";

import apiClient from "@/shared/api/apiClient";

// --- Định nghĩa Types ---
type TerminalProps = {
  labId: number;
  labSessionId: number;
};

interface AnswerFromApi {
  id: number;
  content: string;
  isRightAns: boolean;
}

interface QuestionFromApi {
  id: number;
  question: string;
  solution: string;
  hint: string;
  answers: AnswerFromApi[];
  typeQuestion: string;
}

interface LabDetailsFromApi {
  id: number;
  title: string;
  estimatedTime: number;
}

interface QuestionsApiResponse {
  data: QuestionFromApi[];
}

// Omit 'labSessionId' vì ta sẽ truyền nó sau khi render
type QuestionData = Omit<QuestionProps, "labSessionId">;

const Terminal: React.FC<TerminalProps> = ({ labId, labSessionId }) => {
  const navigate = useNavigate();

  // --- State ---
  const [labName, setLabName] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect để tải dữ liệu dùng apiClient
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // SỬA: Dùng apiClient.get thay vì fetch
        // Promise.all nhận về mảng các AxiosResponse
        const [labDetailsResponse, questionsResponse] = await Promise.all([
          apiClient.get<LabDetailsFromApi>(`/labs/${labId}`),
          apiClient.get<QuestionsApiResponse>(`/labs/${labId}/questions`),
        ]);

        // SỬA: Lấy dữ liệu từ .data (Axios tự parse JSON)
        const labData = labDetailsResponse.data;
        setLabName(labData.title);

        const questionsApi = questionsResponse.data;
        const questionsFromApi = questionsApi.data;

        if (!Array.isArray(questionsFromApi)) {
          throw new Error("Dữ liệu câu hỏi không hợp lệ.");
        }

        // Map dữ liệu từ API sang cấu trúc UI cần
        const formattedQuestions: QuestionData[] = questionsFromApi.map(
          (q) => ({
            ...q,
            listAnswer: q.answers,
          }),
        );
        setQuestions(formattedQuestions);
      } catch (err: any) {
        // SỬA: Xử lý lỗi chuẩn hơn với Axios
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Không thể tải dữ liệu.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();

    return () => {
      document.body.style.overflow = "";
    };
  }, [labId]);

  // Hàm nộp bài
  const handleSubmitLab = useCallback(async () => {
    if (isSubmitting) return;

    if (
      window.confirm("Bạn có chắc chắn muốn kết thúc và nộp bài lab này không?")
    ) {
      setIsSubmitting(true);
      try {
        // Đã sử dụng apiClient ở đây từ trước, giữ nguyên
        await apiClient.post(`/lab-sessions/${labSessionId}/submit`);
        navigate(`/result`);
      } catch (error) {
        console.error("Không thể nộp bài:", error);
        // Vẫn điều hướng về trang kết quả kể cả khi lỗi (để xem kết quả hiện tại)
        navigate(`/result`);
      }
    }
  }, [labSessionId, navigate, isSubmitting]);

  // Hàm chuyển câu hỏi
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Hàm render sidebar
  const renderSidebarContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-gray-500">
          <Loader2 className="mb-2 h-8 w-8 animate-spin" />
          <span>Đang tải câu hỏi...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-red-600">
          <AlertCircle className="mb-2 h-8 w-8" />
          <span className="font-semibold">Đã xảy ra lỗi</span>
          <span>{error}</span>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-gray-500">
          <span>Lab này không có câu hỏi trắc nghiệm.</span>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
        <Question
          {...questions[currentQuestionIndex]}
          labSessionId={labSessionId}
        />
      </>
    );
  };

  // Giao diện JSX
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <span className="font-bold text-white">i</span>
            </div>
            <span className="font-semibold text-gray-800">Lab Platform</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
            <Clock size={16} className="text-blue-500" />
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
              In Progress
            </span>
            <span>{isLoading ? "Đang tải..." : `Lab: ${labName}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded border border-blue-200 bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-200">
            Report an Issue
          </button>
          <button
            className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            onClick={handleSubmitLab}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang nộp..." : "Mark Complete"}
          </button>
          <div className="ml-4 flex items-center gap-1">
            <button className="rounded p-1 text-gray-500 hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <button className="rounded p-1 text-gray-500 hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="ml-2 h-8 w-8 rounded-full bg-gray-800"></div>
        </div>
      </header>

      <main className="flex flex-1 pt-16">
        <aside className="hidden w-80 flex-col border-r border-gray-200 bg-white md:flex">
          <div className="flex items-center justify-center gap-2 border-b border-gray-100 p-4">
            <Clock size={16} className="text-gray-500" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderSidebarContent()}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2 px-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-800">
                Terminal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
                onClick={handleSubmitLab}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Đang nộp bài...</span>
                  </>
                ) : (
                  <>
                    <Square size={12} className="fill-current text-red-500" />
                    <span>Stop Lab</span>
                  </>
                )}
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ExternalLink size={12} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-800">
            {labSessionId ? (
              <Console labSessionId={labSessionId} />
            ) : (
              <div className="p-5 font-mono text-yellow-400">
                Đang chờ thông tin phiên lab... (Không tìm thấy sessionId)
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terminal;
