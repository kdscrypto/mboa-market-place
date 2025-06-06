
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  isTyping: boolean;
  username?: string;
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  username = "L'autre utilisateur",
  className
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isTyping) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 text-sm text-gray-500", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{username} est en train d'écrire{dots}</span>
    </div>
  );
};

export default TypingIndicator;
