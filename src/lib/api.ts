import { toast } from "sonner";

interface RequestEnvelope {
  messageID: string;
  primaryData: any;
  additionalData: { key: string; value: string }[];
}

interface ResponseEnvelope {
  statusCode: string;
  statusDescription: string;
  messageCode: string;
  messageDescription: string;
  errorInfo: any;
  messageID: string;
  conversationID: string | null;
  additionalData: { key: string; value: string }[];
  primaryData: any;
}

function generateMessageID() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

export async function apiFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  bodyData?: any
): Promise<T> {
  const messageID = generateMessageID();
  const apiBase = import.meta.env.VITE_API_URL || "";
  const url = `${apiBase}/api/v1${path}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  };

  if (method !== "GET" && bodyData !== undefined) {
    const wrappedRequest: RequestEnvelope = {
      messageID,
      primaryData: bodyData,
      additionalData: [{ key: "clientVersion", value: "1.0.0" }],
    };
    options.body = JSON.stringify(wrappedRequest);
    console.log(`[API REQUEST ENVELOPE] ${method} ${url}`, wrappedRequest);
  } else {
    console.log(`[API REQUEST ENVELOPE] ${method} ${url} (messageID: ${messageID})`);
  }

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const data = (await res.json()) as ResponseEnvelope;
    console.log(`[API RESPONSE ENVELOPE] ${url}`, data);

    if (data.statusCode !== "0") {
      throw new Error(data.messageDescription || "Business logic error");
    }
    return data.primaryData as T;
  } catch (error: any) {
    console.error(`[API NETWORK ERROR] ${method} ${url}`, error);
    toast.error(`Live request failed: ${method} ${path}. Reverted to simulated sandbox mode.`);
    throw error;
  }
}
