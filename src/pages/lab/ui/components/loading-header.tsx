import { FC } from "react";

interface LoadingHeaderProps {
  status: string;
}

export const LoadingHeader: FC<LoadingHeaderProps> = ({ status }) => {
  return (
    <div className="mb-8 text-center">
      <div className="relative mb-6 inline-block">
        <div className="text-5xl font-light text-cyan-500">
          Loading
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>
      </div>
      <p className="text-lg text-gray-600">{status}</p>

      <style>{`
        .loading-dots {
          display: inline-block;
        }
        .loading-dots .dot {
          animation: dot-pulse 1.4s infinite ease-in-out;
          opacity: 0;
        }
        .loading-dots .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .loading-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dot-pulse {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
