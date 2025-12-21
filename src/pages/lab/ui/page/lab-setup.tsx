import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

import { getRandomQuote } from "../../data/quotes";
import { LoadingHeader } from "../components/loading-header";
import { ProgressBar } from "../components/progress-bar";
import { QuoteDisplay } from "../components/quote-display";
import { useLabSetupWebSocket } from "../../hooks/useLabSetupWebSocket";

const LabSetup: FC = () => {
  const { labId, sessionId } = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [currentQuote] = useState(() => getRandomQuote());

  const { progress, status } = useLabSetupWebSocket({
    sessionId,
    labId,
    token,
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
