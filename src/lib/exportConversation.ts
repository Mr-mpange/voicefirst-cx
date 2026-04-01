interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
}

interface ConversationExport {
  id: string;
  language: string;
  transcript: TranscriptMessage[];
  summary: string | null;
  duration_seconds: number;
  status: string;
  created_at: string;
}

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function buildTextContent(conv: ConversationExport): string {
  const date = new Date(conv.created_at).toLocaleString();
  let text = `CONVERSATION TRANSCRIPT\n`;
  text += `${"=".repeat(50)}\n`;
  text += `Date: ${date}\n`;
  text += `Language: ${conv.language}\n`;
  text += `Duration: ${formatDuration(conv.duration_seconds)}\n`;
  text += `Status: ${conv.status}\n`;
  text += `${"=".repeat(50)}\n\n`;

  if (conv.transcript.length > 0) {
    text += `TRANSCRIPT\n`;
    text += `${"-".repeat(50)}\n`;
    for (const msg of conv.transcript) {
      const speaker = msg.speaker === "ai" ? "AI" : "Customer";
      text += `[${msg.timestamp}] ${speaker}: ${msg.text}\n`;
    }
    text += `\n`;
  } else {
    text += `No transcript recorded.\n\n`;
  }

  if (conv.summary) {
    text += `AI SUMMARY\n`;
    text += `${"-".repeat(50)}\n`;
    text += `${conv.summary}\n`;
  }

  return text;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsText(conv: ConversationExport) {
  const content = buildTextContent(conv);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const date = new Date(conv.created_at).toISOString().split("T")[0];
  downloadBlob(blob, `conversation-${date}-${conv.id.slice(0, 8)}.txt`);
}

export function exportAsPDF(conv: ConversationExport) {
  const date = new Date(conv.created_at).toLocaleString();
  const duration = formatDuration(conv.duration_seconds);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Conversation Transcript</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; font-size: 12px; line-height: 1.6; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #111; }
  .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
  .meta span { margin-right: 16px; }
  .section-title { font-size: 13px; font-weight: 600; color: #333; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
  .msg { margin-bottom: 8px; }
  .msg .speaker { font-weight: 600; font-size: 11px; }
  .msg .speaker.ai { color: #3b82f6; }
  .msg .speaker.customer { color: #666; }
  .msg .time { color: #999; font-size: 10px; margin-left: 6px; }
  .msg .text { margin-top: 2px; }
  .summary-box { background: #f0f7ff; border: 1px solid #bdd8f5; border-radius: 6px; padding: 12px 16px; margin-top: 8px; }
  .empty { color: #999; font-style: italic; }
  @media print { body { padding: 20px; } }
</style></head><body>`;

  html += `<h1>Conversation Transcript</h1>`;
  html += `<div class="meta">
    <span>📅 ${date}</span>
    <span>🌐 ${conv.language}</span>
    <span>⏱ ${duration}</span>
    <span>📊 ${conv.status}</span>
  </div>`;

  html += `<div class="section-title">Transcript</div>`;
  if (conv.transcript.length > 0) {
    for (const msg of conv.transcript) {
      const speaker = msg.speaker === "ai" ? "AI" : "Customer";
      const cls = msg.speaker === "ai" ? "ai" : "customer";
      html += `<div class="msg">
        <span class="speaker ${cls}">${speaker}</span><span class="time">${msg.timestamp}</span>
        <div class="text">${msg.text}</div>
      </div>`;
    }
  } else {
    html += `<p class="empty">No transcript recorded.</p>`;
  }

  if (conv.summary) {
    html += `<div class="section-title">AI Summary</div>`;
    html += `<div class="summary-box">${conv.summary}</div>`;
  }

  html += `</body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
