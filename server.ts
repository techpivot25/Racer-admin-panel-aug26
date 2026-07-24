import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers with high limits to receive live panel data
  app.use(express.json({ limit: '10mb' }));

  // API route for Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, panelData } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Safeguard key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not configured. Please configure it in your Secrets tab." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // System instruction explaining capabilities and providing the live data context
      const systemInstruction = `You are the B&J Enterprise Admin Intelligent Assistant, a highly capable AI agent embedded directly in the B&J Admin Panel.
You have real-time access to the entire B&J Admin Panel's databases, metadata, and financial records.

Here is the current live database context of the B&J Admin Panel:
${JSON.stringify(panelData, null, 2)}

Your primary goals:
1. Provide accurate, insightful, and professional answers to any administrative, billing, licensing, support, product, or user questions.
2. Analyze data, calculate trends, check SLA details, and summarize findings.
3. Keep answers concise and direct unless the user asks for detailed analysis.

CRITICAL INSTRUCTIONS FOR GRAPHS & VISUAL ANALYTICS:
If the user asks for a chart, graph, visualization, comparison, or trend, you MUST include a JSON block in your markdown response. This JSON block will be rendered as a real, interactive Recharts graph inside the chat thread.
The JSON block MUST follow this exact schema:
\`\`\`json
{
  "type": "chart",
  "chartType": "bar" | "line" | "pie" | "area",
  "title": "A highly descriptive title for the chart",
  "xAxisKey": "string (name of the property for x-axis)",
  "yAxisKey": "string (name of the property for y-axis)",
  "data": [
    { "name": "label1", "value": number },
    ...
  ]
}
\`\`\`
Example:
\`\`\`json
{
  "type": "chart",
  "chartType": "bar",
  "title": "Projected Monthly Contract Revenue by Customer",
  "xAxisKey": "name",
  "yAxisKey": "value",
  "data": [
    { "name": "Stark Industries", "value": 5400 },
    { "name": "Wayne Enterprises", "value": 23250 }
  ]
}
\`\`\`
Ensure data points are calculated accurately based on the panel data! Do not make up fake customer names or numbers; only use the real data above.

CRITICAL INSTRUCTIONS FOR REPORTS & DOWNLOADS:
If the user asks for a report, spreadsheet, download format, CSV, or detailed table, you MUST include a JSON block in your markdown response. This JSON block will be parsed by the UI to render a gorgeous, readable table with direct "Download as CSV" and "Download as JSON" action buttons.
The JSON block MUST follow this exact schema:
\`\`\`json
{
  "type": "report",
  "filename": "custom_report_name.csv",
  "columns": ["Column Heading 1", "Column Heading 2", "Column Heading 3"],
  "rows": [
    ["Value 1-1", "Value 1-2", "Value 1-3"],
    ["Value 2-1", "Value 2-2", "Value 2-3"]
  ]
}
\`\`\`
Example:
\`\`\`json
{
  "type": "report",
  "filename": "active_users_sla_report.csv",
  "columns": ["User Name", "Email", "Role", "Customer Link"],
  "rows": [
    ["Sarah Connor", "sarah@connor.org", "Administrator", "B&J Inc."],
    ["Bruce Wayne", "bruce@wayne.com", "External Liaison", "Wayne Enterprises"]
  ]
}
\`\`\`

You can output both plain text explanations, bulleted summaries, tables, AND these custom JSON blocks in a single turn. The user can see the text and interactive elements.
Keep your answers professional, helpful, and concise.`;

      // Convert history format if present
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Robust retry & fallback mechanism to handle temporary 503/429 high demand spikes
      const executeWithRetryAndFallback = async () => {
        const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        let lastError: any = null;

        for (const model of modelsToTry) {
          let retries = 3;
          let delay = 600;

          while (retries > 0) {
            try {
              console.log(`[Gemini API] Requesting ${model}...`);
              const response = await ai.models.generateContent({
                model: model,
                contents: contents,
                config: {
                  systemInstruction: systemInstruction,
                  temperature: 0.1,
                }
              });
              console.log(`[Gemini API] Successfully generated content using ${model}`);
              return response;
            } catch (err: any) {
              lastError = err;
              const errStr = String(err.message || err.status || err.code || JSON.stringify(err));
              console.warn(`[Gemini API] Error using model ${model}: ${errStr}`);
              
              const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand");
              const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota");
              
              if (is503 || is429) {
                retries--;
                if (retries > 0) {
                  console.warn(`[Gemini API] 503/429 encountered. Retrying ${model} in ${delay}ms... (${retries} retries left)`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  delay *= 2;
                  continue;
                }
              }
              // If it's a non-retryable error, or we ran out of retries for this model, fall back to next model
              break;
            }
          }
        }
        throw lastError || new Error("Failed to generate content after retries on multiple Gemini models.");
      };

      const response = await executeWithRetryAndFallback();
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/chat route:", error);
      res.status(500).json({ error: error.message || "An error occurred during Gemini processing" });
    }
  });

  // Explicit endpoints to serve schema files directly from the workspace's public directory
  app.get("/admin_panel_schema.md", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "admin_panel_schema.md"));
  });

  app.get("/admin_panel_schema.json", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "admin_panel_schema.json"));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
