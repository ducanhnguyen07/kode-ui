import { Terminal } from "@/pages"; // Giả sử đường dẫn import của bạn là đúng
import { FC } from "react";
import { useParams } from "react-router-dom";

const Lab: FC = () => {
  const { labId, sessionId } = useParams<{ labId: string; sessionId: string }>();

  const parsedLabId = labId ? parseInt(labId, 10) : undefined;
  const parsedSessionId = sessionId ? parseInt(sessionId, 10) : undefined;

  if (!parsedLabId || !parsedSessionId) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Lỗi: Không tìm thấy ID của Lab hoặc Session trong URL.
      </div>
    );
  }

  return (
    <Terminal labId={parsedLabId} labSessionId={parsedSessionId} />
  );
};

export default Lab;