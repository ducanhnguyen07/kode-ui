import { FC, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { getRandomQuote } from "../../data/quotes";
import { useLabSetupWebSocket } from "../../hooks/useLabSetupWebSocket";

const LabSetup: FC = () => {
  const { labId, sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuote] = useState(() => getRandomQuote());
  const [dots, setDots] = useState("");

  const socketUrl = location.state?.socketUrl;

  if (!socketUrl) {
    navigate(`/courses`);
    return null;
  }

  const { progress } = useLabSetupWebSocket({
    sessionId,
    labId,
    socketUrl,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-2xl px-6">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-10 mt-4 text-center">
            <div className="relative mx-auto mb-10 flex h-40 w-40 items-center justify-center">
              <div className="absolute h-32 w-32 animate-spin rounded-full border-[10px] border-cyan-100 border-t-cyan-500"></div>

              <img
                src="/favicon.png"
                alt="DevOps Icon"
                className="relative z-10 h-20 w-20 object-contain"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xl text-gray-600">
                Sinh viên vui lòng chờ trong giây lát{dots}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Tiến độ khởi tạo
              </span>
              <span className="text-sm font-bold text-cyan-600">
                {progress}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="rounded-lg border-l-4 border-cyan-500 bg-gray-50 p-4">
            <p className="mb-1 text-sm italic text-gray-700">
              {currentQuote.text}
            </p>
            <p className="text-xs text-gray-500">— {currentQuote.author}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabSetup;
