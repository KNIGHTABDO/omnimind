import axios from "axios";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_TOKEN = process.env.GITHUB_COPILOT_TOKEN;
const MOONDREAM_KEY = process.env.MOONDREAM_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TINYFISH_KEY = process.env.TINYFISH_API_KEY;

async function tinyfishSearch(query: string) {
  if (!TINYFISH_KEY) return null;
  try {
    const response = await axios.get("https://api.search.tinyfish.ai", {
      params: { query },
      headers: { "X-API-Key": TINYFISH_KEY },
      timeout: 15000,
    });
    return response.data;
  } catch {
    return null;
  }
}

async function tinyfishFetch(url: string) {
  if (!TINYFISH_KEY) return null;
  try {
    const response = await axios.get("https://api.fetch.tinyfish.ai", {
      params: { url },
      headers: { "X-API-Key": TINYFISH_KEY },
      timeout: 15000,
    });
    return response.data;
  } catch {
    return null;
  }
}

let cachedToken: string | undefined = undefined;
let tokenExpiresAt = 0;

async function getCopilotToken() {
  if (!GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_COPILOT_TOKEN");
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt > now + 300) {
    return cachedToken;
  }

  const response = await axios.get("https://api.github.com/copilot_internal/v2/token", {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "GithubCopilot/1.155.0",
      Accept: "application/json",
    },
    timeout: 15000,
  });

  cachedToken = response.data.token || undefined;
  tokenExpiresAt = response.data.expires_at || now + 1800;
  return cachedToken!;
}

async function analyzeImageWithMoondream(base64Image: string) {
  if (!MOONDREAM_KEY) return null;

  const dataUri = base64Image.startsWith("data:") ? base64Image : `data:image/jpeg;base64,${base64Image}`;

  try {
    const response = await axios.post(
      "https://api.moondream.ai/v1/query",
      {
        image_url: dataUri,
        question:
          "Describe this image in extreme detail. Focus on text, objects, colors, and layout. Provide a comprehensive summary for an AI assistant to understand the visual context.",
      },
      {
        headers: {
          "X-Moondream-Auth": MOONDREAM_KEY,
        },
        timeout: 15000,
      },
    );
    return response.data.answer;
  } catch {
    return null;
  }
}

const MODEL_EXPERTISE = {
  "gpt-5.2": "Flagship specialist for deep reasoning, complex architectural analysis, and multi-file debugging. Best for 'impossible' engineering tasks.",
  "gpt-4.1": "The reliable core for general development. High-fidelity logic for feature implementation and technical documentation.",
  "gemini-3.1-pro-preview": "Advanced agentic model with 1M+ context. Superior at multi-step reasoning, agentic tool-use, and precise multimodal vision.",
  "gemini-2.5-pro": "Nuanced creative reasoning specialist. Best for creative writing, brainstorming, and complex instructional content.",
  "gpt-5-mini": "Ultra-fast next-gen brain. High intelligence with sub-second latency for quick fixes and utility logic.",
  "claude-haiku-4.5": "Creative speed specialist. Unmatched for rapid drafting, creative copy, and boilerplate generation.",
  "llama-3.3-70b-versatile": "Groq-hosted speed flagship. Incredible for rapid technical Q&A and sub-second reasoning on large datasets.",
  "oswe-vscode-prime": "Raptor-class coding specialist. Optimized for repository context and local file manipulation.",
};

const MODEL_CATALOG = {
  "gpt-5.2": "Next-generation flagship with unmatched reasoning and coding capabilities.",
  "gpt-5-mini": "Ultra-fast, highly intelligent small model from the GPT-5 family.",
  "gpt-4.1": "Advanced reasoning model with 2025 knowledge cutoff.",
  "gpt-4o": "Omni model balancing speed and high-level reasoning.",
  "claude-haiku-4.5": "The fastest model in the Claude 4.5 family, excellent for creative tasks.",
  "gemini-3.1-pro-preview": "Google's most capable multimodal model with 1M+ context window.",
  "gemini-3-flash-preview": "Ultra-low latency model for instant interactions.",
  "gemini-2.5-pro": "Balanced model with excellent reasoning and creative writing.",
  "oswe-vscode-prime": "Raptor mini (Preview) - specialized for coding and logic.",
  "gpt-4-0125-preview": "Reliable high-intelligence model for technical tasks.",
  "llama-3.3-70b-versatile": "Open-source flagship hosted on Groq for sub-second responses.",
  "llama-3.1-8b-instant": "Lightweight, instant response model from Meta.",
};

const MODEL_CHAINS = {
  "omnimind-1": ["gpt-5.2", "gpt-4.1", "gpt-4o-2024-11-20", "gpt-4o", "gpt-4-0125-preview", "llama-3.3-70b-versatile"],
  "omnimind-1-turbo": [
    "gpt-5-mini",
    "gpt-4o-mini",
    "claude-haiku-4.5",
    "gemini-3-flash-preview",
    "oswe-vscode-prime",
    "llama-3.1-8b-instant",
  ],
  "omnimind-1-vision": ["gpt-4o", "gemini-3.1-pro-preview", "gemini-2.5-pro", "gpt-4o-mini-2024-07-18"],
};

type ChatMessage = { role: string; content: string };

function extractTextFromChunkValue(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractTextFromChunkValue).join("");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.deltaContent === "string") {
      return record.deltaContent;
    }

    if (typeof record.text === "string") {
      return record.text;
    }

    if (typeof record.content === "string") {
      return record.content;
    }

    if (record.type === "text" && typeof record.text === "string") {
      return record.text;
    }
  }

  return "";
}

function extractAssistantText(payload: any): string {
  if (payload?.type === "assistant.message_delta" || payload?.type === "assistant.message") {
    return extractTextFromChunkValue(payload?.data?.deltaContent) || extractTextFromChunkValue(payload?.data?.content);
  }

  return (
    extractTextFromChunkValue(payload?.choices?.[0]?.delta?.content) ||
    extractTextFromChunkValue(payload?.choices?.[0]?.message?.content)
  );
}

function extractAssistantReasoning(payload: any): string {
  if (payload?.type === "assistant.reasoning_delta" || payload?.type === "assistant.reasoning") {
    return extractTextFromChunkValue(payload?.data?.deltaContent) || extractTextFromChunkValue(payload?.data?.content);
  }

  return (
    extractTextFromChunkValue(payload?.choices?.[0]?.delta?.reasoning_text) ||
    extractTextFromChunkValue(payload?.choices?.[0]?.message?.reasoning_text)
  );
}

function parseSseEventBlock(eventBlock: string): any | null {
  const dataLines = eventBlock
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) {
    return null;
  }

  const payload = dataLines.join("\n");
  if (!payload || payload === "[DONE]") {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const writeLine = async (payload: any) => {
    await writer.write(encoder.encode(`${JSON.stringify(payload)}\n`));
  };

  void (async () => {
    try {
      const data = (await req.json()) as { messages: ChatMessage[]; model: string; attachments?: string[] };
      const fullMessages = data.messages ?? [];
      const messages = fullMessages.length > 24 ? fullMessages.slice(-24) : fullMessages;
      const model = data.model;
      const attachments = data.attachments;

      await writeLine({ text: "", reasoning: "🧠 OmniMind Brain initiated." });

      const category = (model as keyof typeof MODEL_CHAINS) || "omnimind-1";
      const chain = MODEL_CHAINS[category] || MODEL_CHAINS["omnimind-1"];

      let documentContext = "";
      let visionContext = "";
      let visionAdvisory = "";
      let reasoningChain = "🧠 OmniMind Brain initiated.";

      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.startsWith("data:image/")) {
            if (category !== "omnimind-1-vision") {
              visionAdvisory =
                "\n\n[SYSTEM ADVISORY]: The user has uploaded an image but is NOT in 'OmniMind-1 Vision' mode. You must briefly mention that for professional-grade vision analysis they should switch to Vision mode.\n\n";
              reasoningChain += "\n⚠️ Vision specialist pool recommended for high-fidelity image analysis.";
            }
            const analysis = await analyzeImageWithMoondream(attachment);
            if (analysis) {
              visionContext += `[VISUAL CONTEXT]: ${analysis}\n\n`;
              reasoningChain += "\n👁️ Vision specialist analyzed image successfully.";
            }
          } else if (attachment.startsWith("data:text/") || attachment.startsWith("data:application/")) {
            try {
              const [meta, base64Data] = attachment.split(",");
              const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
              documentContext += `[DOCUMENT CONTENT]:\n${decoded}\n\n`;
              reasoningChain += `\n📄 Document ingested: ${meta.split(";")[0].split(":")[1]}`;
            } catch {
              reasoningChain += "\n⚠️ Document ingestion failed.";
            }
          }
        }
      }

      const lastMessage = messages[messages.length - 1];

      let modelId = chain[0];
      let routingRationale = "Primary specialist selected by default.";
      let searchResults: any = null;
      let fetchResults: any = null;

      try {
        const poolExpertise = chain
          .map((id) => `- ${id}: ${MODEL_EXPERTISE[id as keyof typeof MODEL_EXPERTISE] || "General purpose specialist."}`)
          .join("\n");

        const routerPrompt = `You are the OmniMind Brain Router. 
Analyze the user's request and orchestrate the BEST specialist flow.

MODEL EXPERTISE MAP:
${poolExpertise}

SPECIALIST CAPABILITIES:
- WEB SEARCH: If the request requires up-to-date facts, prices, news, or grounding, set "search" to true.
- DEEP READER: If the user provided a URL or needs to "read" a specific page to answer, set "fetch" to true and provide the "url".
- GROUNDING: If the request is highly technical or factual, set "ground" to true to perform a verification search.

USER REQUEST: "${lastMessage.content}"

RESPONSE FORMAT:
Return ONLY a JSON object:
{
  "model": "ID", 
  "rationale": "Short explanation",
  "search": boolean,
  "searchQuery": "string if search or ground is true",
  "fetch": boolean,
  "url": "string if fetch is true",
  "thought": "Internal reasoning about this orchestration"
}`;

        const token = await getCopilotToken();
        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), 15000);

        const routerResponse = await fetch("https://api.githubcopilot.com/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Editor-Version": "vscode/1.85.0",
            "Editor-Plugin-Version": "copilot/1.155.0",
            "User-Agent": "GithubCopilot/1.155.0",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: routerPrompt }],
            temperature: 0,
            response_format: { type: "json_object" },
          }),
          signal: ac.signal,
        }).finally(() => clearTimeout(timeout));

        if (routerResponse.ok) {
          const routerData = await routerResponse.json();
          const routingResult = JSON.parse(routerData.choices?.[0]?.message?.content || "{}");

          if (routingResult.model && chain.includes(routingResult.model)) {
            modelId = routingResult.model;
            routingRationale = routingResult.rationale || "Selected based on intent analysis.";
            reasoningChain += `\n🎯 Handpicked Specialist: ${modelId} - ${routingRationale}`;

            if (routingResult.thought) {
              reasoningChain += `\n💡 Brain Logic: ${routingResult.thought}`;
            }

            if (routingResult.search || routingResult.ground) {
              const query = routingResult.searchQuery || lastMessage.content;
              reasoningChain += `\n🔍 Engaging Web Search for: "${query}"...`;
              await writeLine({ text: "", model: modelId, rationale: routingRationale, reasoning: reasoningChain });
              searchResults = await tinyfishSearch(query);
              const resultCount = searchResults?.results?.length || 0;
              reasoningChain += searchResults ? `\n✅ Search complete. Found ${resultCount} sources.` : "\n⚠️ Search yielded no results.";
            }

            if (routingResult.fetch && routingResult.url) {
              reasoningChain += `\n📖 Engaging Deep Reader for: ${routingResult.url}...`;
              await writeLine({ text: "", model: modelId, rationale: routingRationale, reasoning: reasoningChain });
              fetchResults = await tinyfishFetch(routingResult.url);
              reasoningChain += fetchResults
                ? `\n✅ Deep Read complete. Ingested ${fetchResults.text?.length || 0} characters.`
                : "\n⚠️ Deep Read failed.";
            }
          }
        }
      } catch (e: any) {
        reasoningChain += `\n⚠️ Routing error: Falling back to default specialist. ${e?.message || ""}`.trimEnd();
      }

      const isGroq = modelId.includes("llama") || modelId.includes("groq") || modelId.includes("allam");

      const catalogInfo = Object.entries(MODEL_CATALOG)
        .map(([id, desc]) => `- ${id}: ${desc}`)
        .join("\n");

      const systemPrompt = `You are OmniMind, a premium, unified AI entity. 
You are currently operating within the ${category} specialist pool.

ROUTING CONTEXT:
The OmniMind Brain Router has specifically selected YOU (${modelId}) to handle this request because of your superior capabilities for this specific task.

IDENTITY RULES:
- Your name is ONLY OmniMind.
- NEVER mention underlying model names (like gpt-4o, llama, gemini, etc.) to the user.
- If asked what model you are, respond that you are OmniMind, an intelligent orchestrator of specialized AI brains.
- Maintain a premium, professional, and slightly witty persona.

AVAILABLE SPECIALIST POOL (For your internal awareness only):
${catalogInfo}

${visionAdvisory ? "CRITICAL: You MUST tell the user to switch to Vision mode for better image understanding, but DO NOT mention Moondream or gpt-4o by name." : ""}
If vision context is provided, use it to 'see' what the user has uploaded.`;

      const enrichedMessages: { role: string; content: string }[] = [{ role: "system", content: systemPrompt }, ...messages.slice(0, -1)];

      if (visionContext || documentContext || visionAdvisory) {
        enrichedMessages.push({
          role: "system",
          content: `ATTACHMENT DATA:\n${visionContext}${documentContext}${visionAdvisory}`,
        });
      }

      enrichedMessages.push(lastMessage);

      const limitedSearchResults = searchResults?.results ? searchResults.results.slice(0, 6) : [];

      if (limitedSearchResults.length > 0) {
        const searchContext = limitedSearchResults
          .map((r: any) => `Source: ${r.title}\nURL: ${r.url}\nSnippet: ${String(r.snippet || "").slice(0, 400)}`)
          .join("\n\n");
        enrichedMessages.push({
          role: "system",
          content: `WEB SEARCH CONTEXT:\n${searchContext}\n\nUse the above information to provide accurate and up-to-date answers. 
IMPORTANT: DO NOT include a "Sources" or "References" section in your text response. 
The UI will automatically display the sources based on metadata. Simply provide the answer.`,
        });
      }

      if (fetchResults && fetchResults.text) {
        enrichedMessages.push({
          role: "system",
          content: `DEEP READER CONTEXT (Full Page Content):\n${fetchResults.text}\n\nUse this full page content for precise reasoning and quoting.`,
        });
      }

      const citations = [
        ...(limitedSearchResults.map((r: any) => ({ url: r.url, title: r.title })) || []),
        ...(fetchResults?.url ? [{ url: fetchResults.url, title: fetchResults.title || "Deep Read Source" }] : []),
      ];

      await writeLine({ text: "", model: modelId, rationale: routingRationale, citations, reasoning: reasoningChain });

      if (isGroq) {
        if (!GROQ_API_KEY) {
          throw new Error("Missing GROQ_API_KEY");
        }

        const provider = createOpenAI({ apiKey: GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
        const result = await streamText({
          model: provider(modelId),
          messages: enrichedMessages as any,
        });

        for await (const text of result.textStream) {
          await writeLine({ text, model: modelId, rationale: routingRationale, citations, reasoning: reasoningChain });
        }

        await writer.close();
        return;
      }

      const token = await getCopilotToken();
      const response = await fetch("https://api.githubcopilot.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Editor-Version": "vscode/1.85.0",
          "Editor-Plugin-Version": "copilot/1.155.0",
          "User-Agent": "GithubCopilot/1.155.0",
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: modelId,
          messages: enrichedMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`GitHub API error (${response.status}): ${errText}`);
      }

      const responseType = response.headers.get("content-type") || "";
      if (responseType.includes("application/json")) {
        const json = await response.json();
        const text = extractAssistantText(json);
        const reasoningDelta = extractAssistantReasoning(json);

        if (reasoningDelta) {
          reasoningChain += `\n${reasoningDelta}`;
        }

        if (text || reasoningDelta) {
          await writeLine({ text, model: modelId, rationale: routingRationale, citations, reasoning: reasoningChain });
        }

        await writer.close();
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";

      const flushSseEventBlock = async (eventBlock: string) => {
        const sseData = parseSseEventBlock(eventBlock);
        if (!sseData) return;

        const reasoningDelta = extractAssistantReasoning(sseData);
        if (reasoningDelta) {
          reasoningChain += `\n${reasoningDelta}`;
        }

        const text = extractAssistantText(sseData);
        if (text || reasoningDelta) {
          await writeLine({ text, model: modelId, rationale: routingRationale, citations, reasoning: reasoningChain });
        }
      };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const eventBlocks = sseBuffer.split("\n\n");
          sseBuffer = eventBlocks.pop() || "";

          for (const eventBlock of eventBlocks) {
            await flushSseEventBlock(eventBlock);
          }
        }

        if (sseBuffer.trim()) {
          await flushSseEventBlock(sseBuffer);
        }
      }
    } catch (err: any) {
      await writeLine({ text: `\n\n[ERROR] ${err?.message || "Unknown error"}` });
    } finally {
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
