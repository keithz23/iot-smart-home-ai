import { api } from "@/lib/axios";

export interface DeviceActionProposal {
  device: "roof" | "fan" | "led";
  value: 0 | 1;
  reason: string;
}

export interface AIChatResponse {
  conversation_id: number;
  message_id: number;
  answer: string;
  sources: string[];
  action: DeviceActionProposal | null;
}

export interface AIConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources: string[];
  action: DeviceActionProposal | null;
  created_at: string;
}

export async function askAI(message: string, conversationId?: number) {
  const { data } = await api.post<AIChatResponse>("/ai/chat", {
    message,
    conversation_id: conversationId,
  });
  return data;
}

export async function getAIConversations() {
  const { data } = await api.get<AIConversation[]>("/ai/conversations");
  return data;
}

export async function getAIMessages(conversationId: number) {
  const { data } = await api.get<AIMessage[]>(
    `/ai/conversations/${conversationId}/messages`,
  );
  return data;
}

export async function executeAIAction(action: DeviceActionProposal) {
  await api.post("/ai/actions/execute", action);
}
