import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);


app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to mock data.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const ai = getGeminiClient();

// API: Analyze Resume
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, category } = req.body;
    if (!resumeText || !category) {
      return res.status(400).json({ error: "Missing resumeText or category" });
    }

    if (!ai) {
      // Return high-quality mock evaluation if API key is missing
      return res.json({
        score: 74,
        category: category,
        strengths: [
          "Strong foundational summary of roles and project experience.",
          "Clear experience listing with measurable outcome verbs.",
          "Excellent modern tech stack alignment with core principles."
        ],
        gaps: [
          "Omission of specialized international standards.",
          "Lacks visibility of cloud-scale production deployment metrics.",
          "Missing visa and eligibility keywords suited for " + category
        ],
        recommendations: [
          "Reframe bullet points using the Google STAR methodology (Situation, Task, Action, Result).",
          "Include a clear 'Work Authorization' or 'Sponsorship requirements' section at the header.",
          "Add continuous integration/deployment metrics to demonstrate software scale."
        ],
        atsKeywords: [
          "CI/CD Pipelines",
          "International Collaboration",
          "System Scalability",
          "Microservices Architecture"
        ]
      });
    }

    const systemPrompt = `You are a world-class applicant tracking system (ATS) expert specializing in international recruitment and global talent alignment.
Evaluate the candidate's resume text against the target job category: "${category}".
Analyze the technical stack, layout structure, visa compatibility potential, and overall alignment.
Provide a rigorous ATS score (0-100), key strengths, critical gaps, actionable recommendations for improvement, and missing ATS keywords.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Resume text to evaluate:\n\n${resumeText}\n\nTarget Job Category: ${category}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "ATS Score out of 100" },
            category: { type: Type.STRING, description: "Analyzed target category" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly specific strengths found in the resume."
            },
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 major technical or context gaps based on international recruitment standards."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable recommendations to increase response rates."
            },
            atsKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4-5 crucial ATS keywords/skills missing from the resume."
            }
          },
          required: ["score", "category", "strengths", "gaps", "recommendations", "atsKeywords"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(textResult.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error analyzing resume with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// API: Generate Mock Interview Questions
app.post("/api/mock-interview/generate-questions", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Missing target role" });
    }

    if (!ai) {
      return res.json([
        { question: "How do you handle latency and scalability when distributing computational workloads across globally separated regions?", category: "Technical" },
        { question: "Tell me about a time you worked with a cross-cultural or highly distributed engineering team. How did you align communication standards?", category: "Behavioral" },
        { question: "When relocating or adapting to a new international market, what strategies do you employ to quickly integrate into the regional tech culture?", category: "Cultural" },
        { question: "Explain your design philosophy when building applications with severe performance and network latency constraints.", category: "General" }
      ]);
    }

    const systemPrompt = `You are an elite lead hiring interviewer recruiting high-impact international talent.
Generate 4 highly relevant, challenging, and professional interview questions for the role: "${role}".
Make sure the questions include:
- 1 Technical question (deep dive on core architecture or tech stack)
- 1 Behavioral question (cross-functional alignment or leadership)
- 1 Cultural/Relocation question (handling international shifts, remote collaboration, or diversity)
- 1 General situational question.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate 4 interview questions for: ${role}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The direct interview question." },
              category: { type: Type.STRING, description: "Must be exactly 'Technical', 'Behavioral', 'Cultural', or 'General'." }
            },
            required: ["question", "category"]
          }
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(textResult.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error generating questions with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// API: Analyze Answer
app.post("/api/mock-interview/analyze-answer", async (req, res) => {
  try {
    const { role, question, answer } = req.body;
    if (!role || !question || !answer) {
      return res.status(400).json({ error: "Missing role, question, or answer" });
    }

    if (!ai) {
      return res.json({
        score: 82,
        feedback: "Solid answer with relevant terms. To elevate, add concrete metrics and use the STAR method to describe outcomes."
      });
    }

    const systemPrompt = `You are a senior tech recruiter. Evaluate this candidate's answer to the specific interview question for the role: "${role}".
Provide an objective evaluation:
- score: An integer score (0-100) reflecting the quality and depth of the answer.
- feedback: A highly constructive 2-sentence explanation of what was good and how to improve.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Role: ${role}\nQuestion: ${question}\nCandidate Answer: ${answer}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score out of 100" },
            feedback: { type: Type.STRING, description: "Constructive feedback and tips for expansion." }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(textResult.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error analyzing answer with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to analyze answer" });
  }
});

// API: Finalize Scorecard
app.post("/api/mock-interview/finalize", async (req, res) => {
  try {
    const { role, transcript } = req.body;
    if (!role || !transcript) {
      return res.status(400).json({ error: "Missing role or transcript" });
    }

    if (!ai) {
      return res.json({
        communication: 80,
        technical: 85,
        alignment: 78,
        summary: "The candidate shows strong functional competence and clear technical articulation. Key areas of growth involve presenting structured business impact and expressing proactive alignment with international regulatory compliance standards."
      });
    }

    const systemPrompt = `You are the lead HR and Technical Assessor. Based on the complete interview transcript (questions, answers, and individual feedbacks) for the role "${role}", generate a final scorecard.
Calculate scores (0-100) for:
- communication: Clarity, articulation, structured delivery.
- technical: Core competency, understanding of architectures/frameworks.
- alignment: Adaptation potential, global team collaboration mindsets, relocation agility.
Provide a concise, motivating executive summary highlighting their masteries and key focus area for growth.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Role: ${role}\nTranscript:\n${JSON.stringify(transcript)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            communication: { type: Type.INTEGER, description: "Clarity and structure score out of 100" },
            technical: { type: Type.INTEGER, description: "Technical depth score out of 100" },
            alignment: { type: Type.INTEGER, description: "Global cultural fit & adaptation score out of 100" },
            summary: { type: Type.STRING, description: "3-4 sentence comprehensive executive overview." }
          },
          required: ["communication", "technical", "alignment", "summary"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(textResult.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error finalizing scorecard with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to finalize scorecard" });
  }
});

// API: Get AI insights for a specific Job Strategy
app.post("/api/job-strategy/insights", async (req, res) => {
  try {
    const { jobTitle, company, country, techStack } = req.body;
    if (!jobTitle) {
      return res.status(400).json({ error: "Missing job title" });
    }

    if (!ai) {
      return res.json({
        compatibility: 84,
        stackMatch: "80%",
        missingStack: ["CUDA", "JAX"],
        strategy: "Focus your resume bullet points on high-performance C++ and distributed AI training pipelines. For the technical interview, review Transformer self-attention complexity and data parallelism mechanics."
      });
    }

    const systemPrompt = `You are an elite career development strategist. Give a tailored strategic preparation guide for a candidate applying to:
Role: ${jobTitle} at ${company} in ${country}.
Tech Stack: ${techStack?.join(", ") || "General AI tech stack"}.
Calculate:
- compatibility: A realistic integer percentage (60-95%) based on standard profiles.
- strategy: Clear, targeted advice (2-3 sentences) on how to prepare, key projects to highlight, and what to emphasize in interviews.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Job Title: ${jobTitle}\nCompany: ${company}\nCountry: ${country}\nTech Stack: ${JSON.stringify(techStack)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            compatibility: { type: Type.INTEGER, description: "Profile compatibility score (60-95)" },
            strategy: { type: Type.STRING, description: "Deep tactical advice for acing this specific application." }
          },
          required: ["compatibility", "strategy"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(textResult.trim());
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error fetching job strategy insights with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to fetch job strategy insights" });
  }
});

// API: Gemini Chatbot proxy supporting Search and Maps Grounding
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, systemInstruction, useSearch, useMaps, location } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages array" });
    }

    if (!ai) {
      // If API key is missing, return a simulated, helpful chatbot response
      const lastMessage = messages[messages.length - 1]?.parts?.[0]?.text || "Hello";
      return res.json({
        text: `[FALLBACK] I parsed your prompt: "${lastMessage}". Please set up your GEMINI_API_KEY in the Settings > Secrets menu to experience live, real-time AI responses, Google Search grounding, and Google Maps grounding!`,
        groundingMetadata: {}
      });
    }

    // Determine the active model. Default to gemini-3.5-flash
    let activeModel = model || "gemini-3.5-flash";

    // Set up tools and toolConfig
    const tools: any[] = [];
    let toolConfig: any = undefined;

    if (useSearch) {
      tools.push({ googleSearch: {} });
    } else if (useMaps) {
      tools.push({ googleMaps: {} });
      if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }
    }

    // Call generateContent
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: messages,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: toolConfig
      }
    });

    res.json({
      text: response.text || "",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || {}
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat response" });
  }
});

// WebSocket Server for Gemini Live API Voice Conversation
const wss = new WebSocketServer({ server, path: "/api/live-ws" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to Live API WebSocket proxy");
  let session: any = null;

  try {
    if (!ai) {
      console.warn("No Gemini Client initialized for Live API proxy");
      clientWs.send(JSON.stringify({ error: "Gemini client not initialized. Set GEMINI_API_KEY." }));
      clientWs.close();
      return;
    }

    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: "You are Global Career Hub's friendly AI Career Advisor. Respond in a brief, encouraging, professional manner, helping the user navigate international resume standards, visa sponsorships, and interviews. Keep your verbal replies short (1-2 sentences) and natural.",
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on("message", (data) => {
      try {
        const { audio } = JSON.parse(data.toString());
        if (audio && session) {
          session.sendRealtimeInput({
            audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
      } catch (err) {
        console.error("Error sending realtime input to Gemini Live:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected from Live API WS. Closing Gemini Live session.");
      if (session) {
        try {
          session.close();
        } catch (e) {
          console.error("Error closing Live session:", e);
        }
      }
    });

    clientWs.on("error", (err) => {
      console.error("Client WS error:", err);
      if (session) {
        try {
          session.close();
        } catch (e) {}
      }
    });

  } catch (err: any) {
    console.error("Error establishing Gemini Live Session:", err);
    clientWs.send(JSON.stringify({ error: err.message || "Failed to connect to Live API backend" }));
    clientWs.close();
  }
});

// Vite Middleware & Static Asset Hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
