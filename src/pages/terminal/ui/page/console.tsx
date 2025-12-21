// src/pages/terminal/ui/Page/Console.tsx
import { useAppSelector } from "@/app/hooks";
import React, { useRef } from "react";
import { useTerminal } from "../../hooks/useTerminal";
import { useSingleWebSocket } from "../../hooks/useSingleWebSocket";
import { SetupOverlay } from "../components/setup-overlay";

interface ConsoleProps {
  labSessionId: number;
}

const Console: React.FC<ConsoleProps> = ({ labSessionId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  const { termRef } = useTerminal(terminalRef);

  const { connectionStatus, setupProgress, isSetupPhase } = useSingleWebSocket({
    labSessionId,
    token: token || "",
    termRef,
  });

  return (
    <div className="relative h-full w-full">
      <div ref={terminalRef} className="h-full w-full" />

      <SetupOverlay
        show={isSetupPhase}
        progress={setupProgress}
        status={connectionStatus}
      />
    </div>
  );
};

export default Console;
