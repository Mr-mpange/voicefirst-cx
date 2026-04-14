import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language, type } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch knowledge base entries to give AI business context
    let knowledgeContext = "";
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const token = authHeader.replace("Bearer ", "");
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: kbEntries } = await userClient
          .from("knowledge_entries")
          .select("title, category, content")
          .limit(20);

        if (kbEntries && kbEntries.length > 0) {
          knowledgeContext = "\n\nKNOWLEDGE BASE — Use this information to answer customer questions accurately:\n" +
            kbEntries
              .map((e: any) => `[${e.category}] ${e.title}: ${e.content?.slice(0, 500)}`)
              .join("\n\n");
        }
      }
    } catch (e) {
      console.error("KB fetch failed (non-fatal):", e);
    }

    const langName = language || "English";

    const systemPrompt = `You are Alex, a friendly and professional customer support agent on a live phone call.

CRITICAL FORMATTING RULE:
- NEVER use markdown, asterisks, bullet points, numbered lists, bold, italics, or any text formatting.
- Write exactly how a real person speaks on the phone — plain, natural sentences only.

RULES:
- Respond entirely in ${langName}. Never switch languages.
- Keep responses short (1-3 sentences) and conversational, like a real phone call.
- Be warm, natural, and empathetic. Sound like a real human, not a robot.
- Handle billing, account access, tech support, cancellations, and general questions.
- Ask clarifying questions before jumping to solutions.
- If someone wants to cancel, understand why and offer alternatives first.
- Never make up account details, prices, or order numbers.
- If unsure, say you will transfer them to a specialist.
- Drive the conversation forward with follow-up questions.
- Use the knowledge base below if it helps answer the question.
${knowledgeContext}

${type === "greeting" ? "Greet the caller warmly. Introduce yourself as Alex. Ask how you can help — mention things like billing, account access, or technical support as examples. Keep it natural, like a real person picking up the phone." : "Continue the conversation naturally based on the chat history."}`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm sorry, I didn't catch that. Could you repeat?";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("voice-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
