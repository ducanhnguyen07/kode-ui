import { FC, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { getRandomQuote } from "../../data/quotes";
import { LoadingHeader } from "../components/loading-header";
import { ProgressBar } from "../components/progress-bar";
import { QuoteDisplay } from "../components/quote-display";
import { useLabSetupWebSocket } from "../../hooks/useLabSetupWebSocket";

const LabSetup: FC = () => {
  const { labId, sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuote] = useState(() => getRandomQuote());

  const socketUrl = location.state?.socketUrl;

  if (!socketUrl) {
    navigate(`/courses`);
    return null;
  }

  const { progress, status } = useLabSetupWebSocket({
    sessionId,
    labId,
    socketUrl,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-2xl px-8">
        <LoadingHeader status={status} />
        <ProgressBar progress={progress} />
        <QuoteDisplay quote={currentQuote} />
      </div>
    </div>
  );
};

export default LabSetup;
