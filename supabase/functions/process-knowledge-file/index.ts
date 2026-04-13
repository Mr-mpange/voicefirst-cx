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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { entryId, filePath } = await req.json();
    if (!entryId || !filePath) {
      return new Response(JSON.stringify({ error: "entryId and filePath required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await sb.storage
      .from("knowledge-files")
      .download(filePath);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: "Failed to download file: " + downloadError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = filePath.split("/").pop()?.toLowerCase() || "";
    let extractedText = "";

    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".csv")) {
      extractedText = await fileData.text();
    } else if (fileName.endsWith(".pdf")) {
      // Use unpdf for PDF text extraction
      const { extractText } = await import("https://esm.sh/unpdf@0.12.1");
      const buffer = await fileData.arrayBuffer();
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      extractedText = text;
    } else if (fileName.endsWith(".docx")) {
      // Use mammoth for DOCX
      const mammoth = await import("https://esm.sh/mammoth@1.8.0");
      const buffer = await fileData.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      extractedText = result.value;
    } else if (fileName.endsWith(".json")) {
      const text = await fileData.text();
      extractedText = text;
    } else {
      // Try as plain text
      try {
        extractedText = await fileData.text();
      } catch {
        extractedText = "[Unsupported file format — could not extract text]";
      }
    }

    // Trim to reasonable size
    extractedText = extractedText.slice(0, 50000);

    // Now use AI to summarize and understand the business logic
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    let summary = "";

    if (lovableApiKey && extractedText.length > 0) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a business analyst. Read the following document content and create a clear, structured summary that covers: 1) What the document is about, 2) Key business rules or logic, 3) Important data points or processes, 4) Any actionable items. Keep it concise but comprehensive.",
              },
              {
                role: "user",
                content: `Please analyze this document and extract the key business logic and information:\n\n${extractedText.slice(0, 30000)}`,
              },
            ],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          summary = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI summary failed:", e);
      }
    }

    // Update the knowledge entry with extracted text and summary
    const updateContent = summary || extractedText.slice(0, 5000);
    const { error: updateError } = await sb
      .from("knowledge_entries")
      .update({
        extracted_text: extractedText,
        content: updateContent,
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update entry: " + updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedLength: extractedText.length,
        hasSummary: !!summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Process error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
