"use client";

import { useState } from "react";
import { MessageCircle, Plus, RefreshCw, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  askAI,
  executeAIAction,
  getAIConversations,
  getAIMessages,
  type AIChatResponse,
  type AIConversation,
  type AIMessage,
} from "@/features/ai/api";

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "detail" in error.response.data
  ) {
    return String(error.response.data.detail);
  }
  return "Không thể kết nối với AI. Hãy kiểm tra cấu hình provider.";
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null,
  );
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isExecuting, setIsExecuting] = useState<number | null>(null);

  async function loadConversations() {
    setIsLoadingHistory(true);
    try {
      const items = await getAIConversations();
      setConversations(items);
    } catch {
      setError("Không thể tải lịch sử chat.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function selectConversation(id: number) {
    setError(null);
    setActiveConversationId(id);
    setIsLoadingHistory(true);
    try {
      setMessages(await getAIMessages(id));
    } catch {
      setError("Không thể tải nội dung cuộc trò chuyện.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setMessage("");
    setError(null);
  }

  async function handleSubmit() {
    const content = message.trim();
    if (!content || isLoading) return;

    setError(null);
    setMessage("");
    setIsLoading(true);
    const temporaryUserMessage: AIMessage = {
      id: -Date.now(),
      role: "user",
      content,
      sources: [],
      action: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, temporaryUserMessage]);

    try {
      const response: AIChatResponse = await askAI(
        content,
        activeConversationId ?? undefined,
      );
      setActiveConversationId(response.conversation_id);
      setMessages((current) => [
        ...current,
        {
          id: response.message_id,
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          action: response.action,
          created_at: new Date().toISOString(),
        },
      ]);
      await loadConversations();
    } catch (requestError) {
      setMessages((current) =>
        current.filter((item) => item.id !== temporaryUserMessage.id),
      );
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAction(messageItem: AIMessage) {
    if (!messageItem.action) return;
    setError(null);
    setIsExecuting(messageItem.id);
    try {
      await executeAIAction(messageItem.action);
      setMessages((current) =>
        current.map((item) =>
          item.id === messageItem.id
            ? {
                ...item,
                content: `${item.content}\n\nĐã thực hiện: ${messageItem.action?.device} ${messageItem.action?.value ? "bật" : "tắt"}.`,
                action: null,
              }
            : item,
        ),
      );
    } catch {
      setError("Không thể thực hiện lệnh điều khiển thiết bị.");
    } finally {
      setIsExecuting(null);
    }
  }

  function toggleChat() {
    setIsOpen((open) => {
      const nextOpen = !open;
      if (nextOpen) {
        void loadConversations();
      }
      return nextOpen;
    });
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <section className="mb-4 flex h-[min(42rem,calc(100vh-7rem))] w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                AI Smart Home
              </h2>
              <p className="text-xs text-slate-500">
                Hỏi về cảm biến hoặc điều khiển thiết bị
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Tải lại lịch sử"
                onClick={() => void loadConversations()}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                aria-label="Đóng AI chat"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <aside className="border-b bg-slate-50 p-2 sm:w-40 sm:border-b-0 sm:border-r">
              <button
                type="button"
                onClick={startNewChat}
                className="mb-2 flex w-full items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-left text-xs font-medium text-white hover:bg-sky-700"
              >
                <Plus size={15} />
                Chat mới
              </button>
              <div className="flex max-h-24 gap-1 overflow-x-auto sm:max-h-none sm:flex-col">
                {isLoadingHistory && conversations.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-slate-400">Đang tải...</p>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => void selectConversation(conversation.id)}
                      className={`min-w-32 rounded-lg px-2 py-2 text-left text-xs ${
                        activeConversationId === conversation.id
                          ? "bg-white font-medium text-sky-700 shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      <span className="line-clamp-2">{conversation.title}</span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && !isLoadingHistory ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <MessageCircle size={20} />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Xin chào!
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Nhập câu hỏi để bắt đầu cuộc trò chuyện.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                          item.role === "user"
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <p className="whitespace-pre-line">{item.content}</p>
                        {item.role === "assistant" && item.sources.length > 0 && (
                          <p className="mt-2 text-xs text-slate-500">
                            Nguồn: {item.sources.join(", ")}
                          </p>
                        )}
                        {item.action && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                            <p className="text-xs">
                              Đề xuất {item.action.device}{" "}
                              {item.action.value ? "bật" : "tắt"}:{" "}
                              {item.action.reason}
                            </p>
                            <Button
                              type="button"
                              disabled={isExecuting === item.id}
                              onClick={() => void handleAction(item)}
                              className="mt-2 h-8 px-3 text-xs"
                            >
                              {isExecuting === item.id
                                ? "Đang thực hiện..."
                                : "Xác nhận"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <p className="text-xs text-slate-400">AI đang phân tích...</p>
                )}
                {error && (
                  <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <div className="border-t p-3">
                <div className="flex items-end gap-2 rounded-xl bg-slate-100 p-2">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSubmit();
                      }
                    }}
                    placeholder="Nhập câu hỏi... (Enter để gửi)"
                    rows={2}
                    className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    aria-label="Gửi tin nhắn"
                    disabled={isLoading || !message.trim()}
                    onClick={() => void handleSubmit()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />
                  </button>
                </div>
                <p className="mt-1 px-2 text-[11px] text-slate-400">
                  Shift + Enter để xuống dòng
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      <Button
        type="button"
        aria-label={isOpen ? "Đóng AI chat" : "Mở AI chat"}
        onClick={toggleChat}
        className="ml-auto flex h-14 w-14 rounded-full p-0 shadow-lg transition hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
}
