export type GoverningDocumentSnapshot = {
  kind: "ai_rule" | "brain_principle";
  id: string;
  number: number;
  title: string;
  version: string;
  updatedAt: string;
};

export type PlaygroundFeedback = {
  verdict: "correct" | "incorrect";
  correction: string;
};

export type PlaygroundMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  governingDocuments: GoverningDocumentSnapshot[];
  feedback: PlaygroundFeedback | null;
  createdAt: string;
};

export type PlaygroundConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
