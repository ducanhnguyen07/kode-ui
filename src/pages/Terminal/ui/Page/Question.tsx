import apiClient from "@/shared/api/apiClient";
import { Check, CheckCircle, Loader2, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface Answer {
  id: number;
  content: string;
  isRightAns: boolean;
}

interface QuestionProps {
  id: number;
  question: string;
  hint: string;
  solution: string;
  listAnswer: Answer[];
  typeQuestion: string;
  labSessionId: number;
}

const Question: React.FC<QuestionProps> = ({
  id: questionId,
  question,
  hint,
  solution,
  listAnswer,
  typeQuestion,
  labSessionId,
}) => {
  // Vẫn giữ useSelector để component re-render khi token thay đổi (login/logout),
  // từ đó kích hoạt useEffect chạy lại.
  const { token } = useSelector((state: any) => state.auth);

  const [activeTab, setActiveTab] = useState<string>("task");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab("task");
    setCheckError(null);

    if (!token) return;

    setIsChecking(true);

    // const fetchQuestionStatus = async () => {
    //   try {
    //     // CẬP NHẬT: Thêm ?token=${token} vào URL
    //     const response = await apiClient.get(
    //       `/lab-validation/${labSessionId}/status/${questionId}?token=${token}`,
    //     );

    //     const data = response.data;
    //     if (data.isSubmitted) {
    //       setCheckResult({
    //         success: data.isCorrect,
    //         message: data.isCorrect
    //           ? "Bạn đã hoàn thành câu hỏi này."
    //           : "Bạn đã làm sai câu hỏi này.",
    //       });

    //       if (data.userAnswerId) {
    //         setSelectedOption(data.userAnswerId);
    //       }
    //     } else {
    //       setCheckResult(null);
    //       setSelectedOption(null);
    //     }
    //   } catch (error) {
    //     console.error("Lỗi khi lấy trạng thái câu hỏi:", error);
    //   } finally {
    //     setIsChecking(false);
    //   }
    // };

    // fetchQuestionStatus();
  }, [questionId, labSessionId, token]);

  const isSubmitted = checkResult !== null;

  const handleCheck = async (answerId?: number) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này.");
      return;
    }

    setIsChecking(true);
    setCheckResult(null);
    setCheckError(null);

    try {
      // SỬA: Chuẩn bị body payload
      const payload = answerId !== undefined ? { userAnswer: answerId } : {};

      // SỬA: Dùng apiClient.post
      const response = await apiClient.post(
        `/lab-validation/${labSessionId}/check/${questionId}`,
        payload,
      );

      // Dữ liệu trả về nằm trong response.data
      const result = response.data;
      setCheckResult(result);
    } catch (err: any) {
      // SỬA: Xử lý lỗi từ Axios
      // err.response.data thường chứa message từ backend spring boot
      const errorMessage =
        err.response?.data?.message || err.message || "Kiểm tra thất bại.";
      setCheckError(errorMessage);
    } finally {
      setIsChecking(false);
    }
  };

  const renderTaskContent = () => {
    if (typeQuestion === "non-check") {
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            {listAnswer.map((option: Answer) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.isRightAns;

              let buttonClass =
                "w-full flex items-center justify-between rounded-lg border p-4 text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ";
              let textClass = "font-medium text-gray-800";
              let icon = null;

              if (!isSubmitted && !selectedOption) {
                buttonClass +=
                  "border-gray-300 bg-white hover:border-blue-200 hover:bg-gray-50 focus:ring-blue-500";
              } else {
                if (isCorrect) {
                  buttonClass +=
                    "border-green-500 bg-green-50 text-green-800 shadow-md";
                  textClass = "font-semibold text-green-800";
                  icon = <Check className="h-5 w-5 text-green-600" />;
                } else if (isSelected && !isCorrect) {
                  buttonClass +=
                    "border-red-500 bg-red-50 text-red-800 shadow-md";
                  textClass = "font-semibold text-red-800 line-through";
                  icon = <X className="h-5 w-5 text-red-600" />;
                } else {
                  buttonClass +=
                    "border-gray-200 bg-gray-100 text-gray-500 opacity-70 cursor-not-allowed";
                  textClass = "text-gray-500";
                  if (option.isRightAns) {
                    buttonClass =
                      "border-green-500 bg-green-50 text-green-800 shadow-md";
                    textClass = "font-semibold text-green-800";
                    icon = <Check className="h-5 w-5 text-green-600" />;
                  }
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (!isSubmitted && !isChecking) {
                      setSelectedOption(option.id);
                      handleCheck(option.id);
                    }
                  }}
                  disabled={isChecking || isSubmitted}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-2">
                    {isChecking && selectedOption === option.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    <div className={textClass}>{option.content}</div>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>

          {checkResult && (
            <div
              className={`flex items-center gap-3 rounded-md border p-3 text-sm shadow-sm ${
                checkResult.success
                  ? "border-green-200 bg-green-100 text-green-700"
                  : "border-red-200 bg-red-100 text-red-700"
              }`}
            >
              {checkResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{checkResult.message}</span>
            </div>
          )}
          {checkError && (
            <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700 shadow-sm">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>Lỗi: {checkError}</span>
            </div>
          )}
        </div>
      );
    }

    if (typeQuestion === "check") {
      return (
        <div className="space-y-4">
          <button
            onClick={() => handleCheck()}
            disabled={isChecking || isSubmitted}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold text-white transition-all duration-200 ${
              isSubmitted
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            }`}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : isSubmitted ? (
              checkResult?.success ? (
                "Đã hoàn thành"
              ) : (
                "Đã kiểm tra (Sai)"
              )
            ) : (
              "Kiểm tra"
            )}
          </button>

          {checkResult?.success === true && (
            <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700 shadow-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{checkResult.message}</span>
            </div>
          )}
          {checkResult?.success === false && (
            <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700 shadow-sm">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>{checkResult.message}</span>
            </div>
          )}

          {checkError && (
            <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700 shadow-sm">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>Lỗi: {checkError}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex border-b border-gray-200">
        {["task", "hint", "solution", "assistant"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 p-3 text-sm font-medium capitalize transition-colors duration-200 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "task" && (
          <div className="space-y-4">
            <p className="mb-6 text-base font-normal leading-relaxed text-gray-800">
              {question}
            </p>
            {renderTaskContent()}
          </div>
        )}

        {activeTab === "hint" && (
          <div className="space-y-4 rounded-md border border-gray-200 bg-gray-100 p-4">
            <p className="font-mono text-sm text-gray-700">{hint}</p>
          </div>
        )}

        {activeTab === "solution" && (
          <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-green-300">
              {solution}
            </pre>
          </div>
        )}

        {activeTab === "assistant" && (
          <div className="space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-blue-700">Tính năng Trợ lý (Beta)</p>
          </div>
        )}
      </div>
    </>
  );
};

export type { Answer, QuestionProps };
export { Question };
