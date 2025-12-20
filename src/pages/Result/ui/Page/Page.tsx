import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight, RotateCw, Video, Eye } from "lucide-react";

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
// Định nghĩa sẵn dữ liệu cho các kịch bản khác nhau.
const successData = {
  success: true,
  score: 100,
  timeTaken: "45:15",
};

const failureData = {
  success: false,
  score: 45,
  timeTaken: "52:30",
};


const StaticLabResultPage: FC = () => {
  // Sử dụng state để dễ dàng chuyển đổi giữa hai kịch bản để demo
  const [showSuccess, setShowSuccess] = useState(true);
  
  const result = showSuccess ? successData : failureData;

  // View cho trường hợp thành công
  const SuccessView = () => (
    <div className="hero-content text-center">
      <div className="max-w-md">
        <CheckCircle className="mx-auto h-24 w-24 text-success" />
        <h1 className="mt-6 text-5xl font-bold">Lab Completed!</h1>
        <p className="py-6">Excellent work! You have successfully completed all the tasks.</p>
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/courses" className="btn btn-outline">Back to Courses</Link>
          <Link to="/courses" className="btn btn-primary">
            Next Lesson <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  // View cho trường hợp thất bại
  const FailureView = () => (
    <div className="hero-content text-center">
      <div className="max-w-md">
        <XCircle className="mx-auto h-24 w-24 text-error" />
        <h1 className="mt-6 text-5xl font-bold">Task Failed</h1>
        <p className="py-6">Don't worry, this is part of learning. Review the steps and try again!</p>

        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 my-4">
          <div className="stat">
            <div className="stat-title">Score</div>
            <div className="stat-value text-error">{result.score}%</div>
          </div>
          <div className="stat">
            <div className="stat-title">Time Taken</div>
            <div className="stat-value">{result.timeTaken}</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          {/* Trỏ đến một trang lab giả lập */}
          <Link to="/lab/1" className="btn btn-primary">
            <RotateCw className="h-4 w-4" /> Retry Lab
          </Link>
          <Link to="/solutions" className="btn btn-ghost">
            <Video className="h-4 w-4" /> View Solution
          </Link>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="relative">
      {/* Nút để chuyển đổi giữa các view (chỉ dành cho demo) */}
      {/*<div className="absolute top-4 right-4">
        <button className="btn btn-neutral btn-sm" onClick={() => setShowSuccess(!showSuccess)}>
            <Eye className="h-4 w-4"/>
            Toggle Success/Failure
        </button>
      </div>*/}

      <div className="hero min-h-screen bg-base-200">
        {result.success ? <SuccessView /> : <FailureView />}
      </div>
    </div>
  );
};

export default StaticLabResultPage;