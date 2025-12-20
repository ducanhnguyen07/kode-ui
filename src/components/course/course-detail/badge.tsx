import { FC } from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
}

export const Badge: FC<BadgeProps> = ({ children }) => (
  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
    {children}
  </span>
);
