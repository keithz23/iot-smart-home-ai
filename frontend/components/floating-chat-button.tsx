import { MessageCircle } from "lucide-react";
import React from "react";

export default function FloatingChatButton() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none"
      aria-label="Mở khung chat"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
