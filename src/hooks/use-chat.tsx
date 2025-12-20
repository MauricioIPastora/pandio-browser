import { useState } from "react";

export default function useChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return { isChatOpen, setIsChatOpen, toggleChat, closeChat };
}
