"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { askAI, executeAIAction, type AIChatResponse } from "@/features/ai/api";

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<AIChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      setResponse(await askAI(message.trim()));
      setMessage("");
    } catch (error) {
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
        setError(String(error.response.data.detail));
      } else {
        setError("Không thể kết nối với AI. Hãy kiểm tra cấu hình provider.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAction() {
    if (!response?.action) return;
    setError(null);
    setIsExecuting(true);
    try {
      await executeAIAction(response.action);
      setResponse({
        ...response,
        answer: `${response.answer}\n\nĐã thực hiện: ${response.action.device} ${response.action.value ? "bật" : "tắt"}.`,
        action: null,
      });
    } catch {
      setError("Không thể thực hiện lệnh điều khiển thiết bị.");
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-[min(24rem,calc(100vw-3rem))] overflow-hidden border-slate-200 shadow-xl">
          <CardHeader className="flex-row items-start justify-between gap-4 bg-slate-900 text-white">
            <div>
              <CardTitle className="text-base">AI Smart Home</CardTitle>
              <CardDescription className="mt-1 text-slate-300">
                Hỏi về cảm biến hoặc điều khiển thiết bị.
              </CardDescription>
            </div>
            <button
              type="button"
              aria-label="Đóng AI chat"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto p-4">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  void handleSubmit();
                }
              }}
              placeholder="Ví dụ: Nhiệt độ hiện tại thế nào?"
              className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Button
              type="button"
              disabled={isLoading || !message.trim()}
              onClick={() => void handleSubmit()}
            >
              {isLoading ? "AI đang phân tích..." : "Hỏi AI"}
            </Button>
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {response && (
              <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {response.answer}
                </p>
                {response.sources.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <p className="font-medium">Nguồn tham khảo</p>
                    <ul className="list-disc pl-5">
                      {response.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {response.action && (
                  <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-900">
                      Đề xuất {response.action.device}{" "}
                      {response.action.value ? "bật" : "tắt"}:{" "}
                      {response.action.reason}
                    </p>
                    <Button
                      type="button"
                      disabled={isExecuting}
                      onClick={() => void handleAction()}
                    >
                      {isExecuting ? "Đang thực hiện..." : "Xác nhận"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <Button
        type="button"
        aria-label={isOpen ? "Đóng AI chat" : "Mở AI chat"}
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex h-14 w-14 rounded-full p-0 shadow-lg transition hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
}
