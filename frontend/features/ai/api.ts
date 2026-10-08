import { api } from "@/lib/axios";

export interface DeviceActionProposal {
  device: "roof" | "fan" | "led";
  value: 0 | 1;
  reason: string;
}

export interface AIChatResponse {
  answer: string;
  sources: string[];
  action: DeviceActionProposal | null;
}

export async function askAI(message: string) {
  const { data } = await api.post<AIChatResponse>("/ai/chat", { message });
  return data;
}

export async function executeAIAction(action: DeviceActionProposal) {
  await api.post("/ai/actions/execute", action);
}
