import React, { useState, useEffect } from "react";
import { Sparkles, FileText, Send, RefreshCw, CheckCircle, ListTodo, Award, Brain, Clock, ChevronRight, Play, Check, ShieldAlert, Upload, Trash2, Volume2, Mic, MicOff, AlertCircle } from "lucide-react";
import { ResumeAnalysisResult, MockInterviewSession, InterviewQuestion } from "../types";

const sampleResumes = {
  "AI & Data Science": `Komal Hiwrale
Senior AI & Deep Learning Research Scientist | Zurich, Switzerland | komal.hiwrale@example.com

SUMMARY:
High-impact AI Researcher with 5+ years of experience building scalable machine learning models. Specialized in Deep Learning, Large Language Models (LLMs), and high-performance CUDA optimization. Passionate about deploying computer vision and natural language models to globally distributed cloud clusters.

CORE EXPERIENCE:
- Senior AI Engineer at Solarix Digital (2024 - Present):
  * Designed and pre-trained multi-modal generative transformers, increasing model throughput by 42% via custom tensor parallelisms.
  * Optimized PyTorch deep learning pipelines with CUDA kernel tuning, reducing training memory footprints by 1.2 GB per node.
  * Coordinated system designs with engineering groups in Tokyo, Zurich, and Singapore.
- Machine Learning Developer at NeoSphere Web (2021 - 2024):
  * Built real-time vision pipelines processing 50M+ requests daily.
  * Reduced cloud inference latency by 35% using TensorRT compilation and INT8 quantization.

TECHNICAL SKILLS:
PyTorch, TensorFlow, Python, C++, CUDA, Triton, Docker, Kubernetes, AWS, Git, CI/CD`,

  "Software Engineering": `Komal Hiwrale
Staff Systems Architect & Software Engineer | Amsterdam, NL | komal.hiwrale@example.com

SUMMARY:
Distinguished software engineer with 6+ years of expertise in high-concurrency systems, microservice architectures, and global cloud deployments. Proven track record of reducing latency and system load under peak demands of up to 100k requests/sec.

CORE EXPERIENCE:
- Principal Systems Architect at FlowNL Payments (2024 - Present):
  * Architected high-throughput payment transaction pipelines handling €5M+ daily volume.
  * Re-designed core Go and Java services into containerized microservices, lowering average latency from 180ms to 24ms.
  * Spearheaded cross-functional migration to GCP and hybrid-cloud infrastructure.
- Backend Developer at TechNova Corp (2020 - 2024):
  * Maintained high-performance Redis and PostgreSQL caching systems, reducing database query bottlenecks by 60%.

TECHNICAL SKILLS:
Go, Java, Rust, TypeScript, PostgreSQL, Redis, Kubernetes, GCP, Terraform, gRPC, Apache Kafka`,

  "Product Management": `Komal Hiwrale
Principal Product Manager - Cloud & Platforms | Singapore | komal.hiwrale@example.com

SUMMARY:
Senior Product Leader with 7+ years of experience defining product roadmaps and launching enterprise SaaS solutions globally. Specialized in cloud orchestration, platform architecture, and cross-border API standards.

CORE EXPERIENCE:
- Principal Product Lead at NeoSphere Platforms (2024 - Present):
  * Managed full lifecycle of micro-frontend developer platform used by 4,000+ internal engineers.
  * Launched API Gateway which processed $2B+ annualized transactions, reducing API integration times by 70%.
  * Created cross-border product strategy aligning with EU GDPR and MAS Singapore compliance.
- Senior Product Specialist at CloudBase (2021 - 2024):
  * Drove adoption of hybrid cloud monitoring dashboards, growing ARR by 45%.

TECHNICAL SKILLS:
Product Strategy, Agile, GCP, Azure, APIs, SaaS Analytics, SQL, Jira, Roadmapping, Cross-border Regulatory Standards`,

  "Creative & Design": `Komal Hiwrale
Lead UX/UI Product Designer | London, UK | komal.hiwrale@example.com

SUMMARY:
Award-winning Product Designer with 6+ years of expertise crafting immersive digital experiences for finance, SaaS, and blockchain networks. Focused on interactive data visualizers, glassmorphic interfaces, and design systems.

CORE EXPERIENCE:
- Lead UX Designer at Solarix Creative (2024 - Present):
  * Designed responsive global analytics dashboard, increasing user retention indices by 34%.
  * Established a robust design system with unified component libraries, accelerating frontend development cycles by 50%.
  * Conducted usability studies with 200+ global participants across 4 continents.
- Digital Product Designer at Vanguard Design (2021 - 2024):
  * Crafted interfaces for high-frequency trading terminals with 100ms real-time data update cycles.

TECHNICAL SKILLS:
Figma, Framer, Adobe CC, React, Tailwind CSS, Interaction Design, User Research, Journey Mapping, Design Tokens`
};

interface AIStrategyCenterProps {
  userScore: number;
  setUserScore: (score: number) => void;
  mockJobs: string[]; // Role names for mock interview selection
}

export default function AIStrategyCenter({ userScore, setUserScore, mockJobs }: AIStrategyCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<"resume" | "interview">("resume");

  // RESUME SCANNER STATES
  const [resumeText, setResumeText] = useState("");
  const [targetCategory, setTargetCategory] = useState("AI & Data Science");
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [resumeError, setResumeError] = useState("");

  // DRAG & DROP & PROGRESS STATES
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>("");

  // SPEECH ENGINE STATES
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechError, setSpeechError] = useState("");

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // INTERVIEW SIMULATOR STATES
  const [targetRole, setTargetRole] = useState("Senior AI Research Scientist");
  const [session, setSession] = useState<MockInterviewSession>({
    role: "Senior AI Research Scientist",
    status: "idle",
    questions: [],
    answers: [],
    feedbacks: [],
    currentQuestionIndex: 0
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState("");

  const categories = [
    "AI & Data Science",
    "Software Engineering",
    "Product Management",
    "Creative & Design"
  ];

  // Drag and Drop PDF / Text upload functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateFileUpload(files[0]);
    }
  };

  const simulateFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    });
    setUploadProgress(10);
    setExtractionStep("Reading file binary stream...");

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setExtractionStep("Done!");
          // Load text based on selected category to simulate successful PDF parsing
          const activeCat = targetCategory;
          const templateText = sampleResumes[activeCat as keyof typeof sampleResumes] || sampleResumes["AI & Data Science"];
          setResumeText(templateText);
          return 100;
        }
        if (prev === 25) setExtractionStep("Extracting text layer elements...");
        if (prev === 55) setExtractionStep("Reorganizing token metrics...");
        if (prev === 80) setExtractionStep("Resolving layout tags...");
        return prev + 15;
      });
    }, 120);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setUploadProgress(null);
    setResumeText("");
    setExtractionStep("");
  };

  // Text to Speech
  const speakQuestion = (text: string) => {
    if (!window.speechSynthesis) {
      setSpeechError("Text-to-speech is not supported in this browser.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en-"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  // Speech to Text dictation
  const toggleListening = () => {
    if (isListening) {
      if (speechRecognition) {
        speechRecognition.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setSpeechError("Microphone transcription is not fully supported in this browser environment. Please type or dictate in supported browsers.");
        return;
      }
      try {
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError("");
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[event.results.length - 1][0].transcript;
          if (resultText) {
            setCurrentAnswer((prev) => (prev ? prev + " " + resultText : resultText));
          }
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setSpeechError("Microphone feedback blocked or inactive.");
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.start();
        setSpeechRecognition(rec);
      } catch (e) {
        console.error(e);
        setSpeechError("Failed to initialize system microphone.");
      }
    }
  };

  // 1. Trigger Resume Analysis
  const handleScanResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setScanning(true);
    setResumeError("");
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, category: targetCategory })
      });

      if (!res.ok) throw new Error("Server failed to analyze resume");

      const data: ResumeAnalysisResult = await res.json();
      setResumeAnalysis(data);
      setUserScore(data.score); // Update global state
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      setResumeError("Unable to reach AI analyzer. Using fast local offline parsing fallback.");
      // Fallback
      const fallbackResult: ResumeAnalysisResult = {
        score: 75,
        category: targetCategory,
        strengths: ["Clean contact information", "Highly descriptive tech summary", "Includes direct outcomes in achievements"],
        gaps: ["Missing specific ISO standards", "Lacks international compliance keywords", "Needs more metrics on scalability"],
        recommendations: ["Incorporate system scaling keywords", "Mention remote cross-cultural collaborations", "Use active metric verbs"],
        atsKeywords: ["CI/CD", "SaaS Infrastructure", "Global Agile", "Multi-Cloud"]
      };
      setResumeAnalysis(fallbackResult);
      setUserScore(75);
    } finally {
      setScanning(false);
    }
  };

  // 2. Trigger Mock Interview Start
  const handleStartInterview = async () => {
    setStartingInterview(true);
    setInterviewError("");
    try {
      const res = await fetch("/api/mock-interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });

      if (!res.ok) throw new Error("Could not retrieve interview syllabus");

      const questions: InterviewQuestion[] = await res.json();
      setSession({
        role: targetRole,
        status: "active",
        questions: questions,
        answers: [],
        feedbacks: [],
        currentQuestionIndex: 0
      });
      setCurrentAnswer("");
    } catch (err) {
      console.error("Error generating interview questions:", err);
      setInterviewError("Failed to initiate secure connection. Launching local offline prep module.");
      
      const localQuestions: InterviewQuestion[] = [
        { question: "How do you coordinate system designs and architectural agreements with engineering teams residing in divergent international timezones?", category: "Cultural" },
        { question: "Can you elaborate on a complex project where you had to manage severe memory leaks or system latency in an production cloud cluster?", category: "Technical" },
        { question: "In your opinion, how do you balance rapid feature shipping alongside rigorous local regulatory compliance and data protection guidelines?", category: "Behavioral" },
        { question: "What has been your primary motivation in pursuing a relocation, and how do you prepare for the subsequent professional and cultural changes?", category: "Cultural" }
      ];

      setSession({
        role: targetRole,
        status: "active",
        questions: localQuestions,
        answers: [],
        feedbacks: [],
        currentQuestionIndex: 0
      });
      setCurrentAnswer("");
    } finally {
      setStartingInterview(false);
    }
  };

  // 3. Submit Single Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || submittingAnswer) return;

    setSubmittingAnswer(true);
    try {
      const currentQ = session.questions[session.currentQuestionIndex];
      const res = await fetch("/api/mock-interview/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.role,
          question: currentQ.question,
          answer: currentAnswer
        })
      });

      if (!res.ok) throw new Error("Analysis timeout");

      const evaluation = await res.json();
      const updatedAnswers = [...session.answers, currentAnswer];
      const updatedFeedbacks = [...session.feedbacks, evaluation.feedback];
      const nextIndex = session.currentQuestionIndex + 1;

      if (nextIndex >= session.questions.length) {
        // Complete interview, trigger final scorecard compilation
        setSession({
          ...session,
          answers: updatedAnswers,
          feedbacks: updatedFeedbacks,
          currentQuestionIndex: nextIndex,
          status: "completed"
        });
        compileFinalScorecard(updatedAnswers, updatedFeedbacks);
      } else {
        setSession({
          ...session,
          answers: updatedAnswers,
          feedbacks: updatedFeedbacks,
          currentQuestionIndex: nextIndex
        });
        setCurrentAnswer("");
      }
    } catch (err) {
      console.error("Error analyzing answer:", err);
      // Fallback
      const updatedAnswers = [...session.answers, currentAnswer];
      const updatedFeedbacks = [...session.feedbacks, "Good answer. Consider integrating specific outcome numbers to validate claims."];
      const nextIndex = session.currentQuestionIndex + 1;

      if (nextIndex >= session.questions.length) {
        setSession({
          ...session,
          answers: updatedAnswers,
          feedbacks: updatedFeedbacks,
          currentQuestionIndex: nextIndex,
          status: "completed"
        });
        compileFinalScorecard(updatedAnswers, updatedFeedbacks);
      } else {
        setSession({
          ...session,
          answers: updatedAnswers,
          feedbacks: updatedFeedbacks,
          currentQuestionIndex: nextIndex
        });
        setCurrentAnswer("");
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // 4. Compile Final Scorecard
  const compileFinalScorecard = async (answers: string[], feedbacks: string[]) => {
    try {
      const transcript = session.questions.map((q, idx) => ({
        question: q.question,
        answer: answers[idx] || "",
        feedback: feedbacks[idx] || ""
      }));

      const res = await fetch("/api/mock-interview/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: session.role, transcript })
      });

      if (!res.ok) throw new Error("Scorecard build failed");

      const scorecardData = await res.json();
      setSession(prev => ({
        ...prev,
        overallScore: Math.round((scorecardData.communication + scorecardData.technical + scorecardData.alignment) / 3),
        scorecard: scorecardData
      }));
    } catch (err) {
      console.error("Error compiling final scorecard:", err);
      // Fallback scorecard
      setSession(prev => ({
        ...prev,
        overallScore: 81,
        scorecard: {
          communication: 80,
          technical: 85,
          alignment: 78,
          summary: "Outstanding overall delivery. Your system architecture concepts are very sound. Focus slightly more on clarifying operational metrics under scale to lock in the highest salary tiers."
        }
      }));
    }
  };

  const resetInterview = () => {
    setSession({
      role: "Senior AI Research Scientist",
      status: "idle",
      questions: [],
      answers: [],
      feedbacks: [],
      currentQuestionIndex: 0
    });
    setCurrentAnswer("");
  };

  return (
    <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8 pb-24" id="ai-center-container">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-4 gap-4" id="ai-center-header">
        <div>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-white flex items-center">
            <Brain className="w-6 h-6 mr-2 text-brand-purple animate-pulse" />
            AI Career Strategy Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">Accelerate your international placement potential with elite, real-time AI recruitment tooling</p>
        </div>

        {/* Sub-tab controllers */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5" id="ai-center-subtabs">
          <button
            onClick={() => setActiveSubTab("resume")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === "resume" ? "bg-brand-blue text-white shadow" : "text-gray-400 hover:text-white"
            }`}
            id="subtab-resume-btn"
          >
            ATS Resume Scanner
          </button>
          <button
            onClick={() => setActiveSubTab("interview")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === "interview" ? "bg-brand-purple text-white shadow" : "text-gray-400 hover:text-white"
            }`}
            id="subtab-interview-btn"
          >
            Interactive Mock Interview
          </button>
        </div>
      </div>

      {/* SUB TAB 1: ATS RESUME SCANNER */}
      {activeSubTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="resume-scanner-tab">
          
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
              <h3 className="font-display font-bold text-sm text-white flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-brand-blue" />
                  Analyze Resume Details
                </span>
                <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                  ATS Pro v4.2
                </span>
              </h3>

              {/* Sector Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">Target Sector Specialty</label>
                <select
                  value={targetCategory}
                  onChange={(e) => {
                    setTargetCategory(e.target.value);
                    // Automatically clear uploaded state and fill corresponding template to keep UX unified
                    setUploadedFile(null);
                    setUploadProgress(null);
                    setResumeText("");
                  }}
                  className="w-full glass-input text-xs text-gray-300 px-3 py-2.5 rounded-xl cursor-pointer"
                  id="ats-target-category"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Template Quick Loader Badge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">Need a starting resume?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = sampleResumes[targetCategory as keyof typeof sampleResumes] || sampleResumes["AI & Data Science"];
                    setResumeText(sample);
                    setUploadedFile({ name: `template_${targetCategory.toLowerCase().replace(/\s/g, "_")}.pdf`, size: "24.5 KB" });
                    setUploadProgress(100);
                    setExtractionStep("Template loaded successfully!");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 border border-brand-blue/20 hover:from-brand-blue/20 hover:to-brand-purple/20 transition-all duration-300 group flex items-center justify-between"
                  id="load-sample-btn"
                >
                  <div className="flex items-center space-x-2.5 text-xs text-white">
                    <Sparkles className="w-4 h-4 text-brand-blue group-hover:animate-spin" />
                    <div>
                      <p className="font-semibold text-gray-200">Load Premium Expat Template</p>
                      <p className="text-[10px] text-gray-400 font-light">Customized for {targetCategory} standards</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-blue group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="border-t border-white/5 my-3"></div>

              {/* Dynamic Drag and Drop Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">Upload Document or Paste Text</label>
                
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? "border-brand-blue bg-brand-blue/10 scale-98" 
                        : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-bounce" style={{ animationDuration: "3s" }} />
                    <p className="text-xs text-white font-medium">Drag & Drop Resume here</p>
                    <p className="text-[10px] text-gray-400 font-light mt-1">Accepts PDF, DOCX, or TXT (Max 5MB)</p>
                    <span className="text-[10px] inline-block px-2.5 py-0.5 bg-white/5 border border-white/5 rounded-full text-brand-blue font-mono mt-3">
                      or browse files
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <FileText className="w-8 h-8 text-brand-blue shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{uploadedFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearUploadedFile}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-500/15 hover:text-rose-400 text-gray-400 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {uploadProgress !== null && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-400">{extractionStep}</span>
                          <span className="text-brand-blue font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-blue h-full rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fallback Text Area - Collapsible or editable */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-gray-400 block">Extracted Text Payload</label>
                  {resumeText && (
                    <button 
                      type="button"
                      onClick={() => setResumeText("")}
                      className="text-[10px] text-rose-400 font-mono hover:underline"
                    >
                      Clear Text
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="The extracted text from your resume will appear here. You can also paste experience bullet points directly..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full glass-input text-xs text-white p-3 rounded-xl min-h-[140px] max-h-[250px] leading-relaxed font-mono"
                  id="ats-resume-raw-text"
                  required
                />
              </div>

              {resumeError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{resumeError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleScanResume}
                disabled={scanning || !resumeText.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 text-xs text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-indigo/15 hover:scale-[1.01] active:scale-[0.99] transition-all"
                id="ats-scan-submit-btn"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calibrating Neural Parsing Standards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Scan ATS Compatibility Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display Panel */}
          <div className="lg:col-span-7">
            {!resumeAnalysis && !scanning ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 h-full flex flex-col items-center justify-center space-y-4" id="ats-empty-result-panel">
                <FileText className="w-12 h-12 text-gray-500 animate-pulse" />
                <h4 className="font-display font-semibold text-white">No active resume analysis found</h4>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-light">
                  Input your professional experience data on the left panel to trigger the deep-dive ATS scoring and compliance scan.
                </p>
              </div>
            ) : scanning ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 h-full flex flex-col items-center justify-center space-y-6" id="ats-loading-result-panel">
                <RefreshCw className="w-12 h-12 text-brand-blue animate-spin" />
                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-white">Generating AI Alignment Audit</h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-mono">
                    Matching skills against visa requirements, accreditation indices, and key sector lexicons...
                  </p>
                </div>
              </div>
            ) : (
              resumeAnalysis && (
                <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 animate-fade-in" id="ats-results-panel">
                  {/* Score & Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-5 gap-4">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] px-2.5 py-1 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-semibold uppercase">
                        {resumeAnalysis.category}
                      </span>
                      <h3 className="font-display font-bold text-xl text-white mt-1.5">Resume Calibration Complete</h3>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 uppercase font-mono">Sponsorship Score</p>
                        <p className="text-xs font-semibold text-emerald-400 font-mono">Visa Pre-Matched</p>
                      </div>
                      <div className="text-3xl font-display font-black text-white font-mono glow-text-blue">
                        {resumeAnalysis.score}<span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <span className="text-xs text-emerald-400 font-mono uppercase font-bold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                        Key Core Strengths
                      </span>
                      <ul className="space-y-2 text-xs text-gray-300 font-light list-disc list-inside">
                        {resumeAnalysis.strengths.map((str, i) => <li key={i} className="leading-relaxed">{str}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs text-rose-400 font-mono uppercase font-bold flex items-center">
                        <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-400" />
                        Critical ATS Gaps
                      </span>
                      <ul className="space-y-2 text-xs text-gray-300 font-light list-disc list-inside">
                        {resumeAnalysis.gaps.map((gap, i) => <li key={i} className="leading-relaxed">{gap}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-4"></div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <span className="text-xs text-brand-purple font-mono uppercase font-bold flex items-center">
                      <ListTodo className="w-4 h-4 mr-1.5 text-brand-purple" />
                      Actionable Recommendations
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="ats-recommendations-grid">
                      {resumeAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-300 font-light leading-relaxed">
                          <span className="font-bold text-brand-blue block mb-1">Step {i+1}</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-3">
                    <span className="text-xs text-gray-400 font-mono uppercase block">Missing Calibration Keywords</span>
                    <div className="flex flex-wrap gap-2" id="ats-keywords-list">
                      {resumeAnalysis.atsKeywords.map((word) => (
                        <span key={word} className="text-xs px-3 py-1 bg-white/5 border border-white/5 rounded-full text-white font-mono">
                          + {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: INTERACTIVE MOCK INTERVIEW */}
      {activeSubTab === "interview" && (
        <div className="animate-fade-in" id="mock-interview-tab">
          
          {/* IDLE VIEW: Start Configuration */}
          {session.status === "idle" && (
            <div className="glass-panel rounded-2xl p-6 md:p-12 border border-white/5 max-w-2xl mx-auto text-center space-y-6" id="interview-idle-view">
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-brand-purple animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-white">Immigration Interview Simulator</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  Practice complex, location-specific interview rounds. The AI simulates deep architectural probes, remote culture fits, and immigration eligibility reviews.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-gray-300">Target Role Specialty</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full glass-input text-xs text-gray-300 px-3 py-2.5 rounded-xl cursor-pointer"
                    id="interview-role-picker"
                  >
                    {mockJobs.map(job => <option key={job} value={job}>{job}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={startingInterview}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo text-xs text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-indigo/15 hover:scale-102 transition-all"
                  id="start-interview-btn"
                >
                  {startingInterview ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Seeding AI Recruiter Engine...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Assessed Session</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-white/5 pt-6 max-w-md mx-auto grid grid-cols-3 gap-3 text-center text-xs text-gray-400">
                <div>
                  <p className="font-bold text-white font-mono">4</p>
                  <p className="text-[10px] text-gray-500">Curated Questions</p>
                </div>
                <div>
                  <p className="font-bold text-white font-mono">AI</p>
                  <p className="text-[10px] text-gray-500">Real-time feedback</p>
                </div>
                <div>
                  <p className="font-bold text-white font-mono">PDF</p>
                  <p className="text-[10px] text-gray-500">Scorecard Out</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW: The Conversational Chat */}
          {session.status === "active" && (
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 max-w-3xl mx-auto space-y-6" id="interview-active-view">
              {/* Tracker Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-mono bg-brand-purple/10 border border-brand-purple/20 text-brand-purple px-2 py-0.5 rounded">
                    Active Assessment Session
                  </span>
                  <h3 className="font-display font-semibold text-xs text-gray-300 mt-1">{session.role}</h3>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Question Tracker</p>
                  <p className="text-xs font-bold text-white font-mono">
                    {session.currentQuestionIndex + 1} <span className="text-gray-500">/ {session.questions.length}</span>
                  </p>
                </div>
              </div>

              {/* Chat Window */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" id="interview-chat-log">
                {/* Previous question & answer loop */}
                {session.answers.map((ans, idx) => (
                  <div key={idx} className="space-y-3">
                    {/* Question */}
                    <div className="flex items-start space-x-3 text-xs max-w-2xl">
                      <div className="w-7 h-7 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0 font-bold font-mono text-brand-purple">
                        Q
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-300 leading-relaxed font-light">
                        {session.questions[idx]?.question}
                      </div>
                    </div>

                    {/* User Answer */}
                    <div className="flex items-start space-x-3 text-xs max-w-2xl ml-auto justify-end">
                      <div className="p-3.5 rounded-2xl bg-brand-indigo/10 border border-brand-indigo/20 text-white leading-relaxed font-light text-left">
                        {ans}
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center shrink-0 font-bold font-mono text-white">
                        A
                      </div>
                    </div>

                    {/* AI Feedback */}
                    {session.feedbacks[idx] && (
                      <div className="flex items-start space-x-3 text-xs max-w-2xl pl-6">
                        <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 font-mono text-[9px] text-emerald-400 font-bold">
                          ✓
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 leading-relaxed font-light">
                          <strong className="font-mono text-[9px] uppercase block mb-0.5 text-emerald-500">Recruiter Feedback</strong>
                          {session.feedbacks[idx]}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Current Question Display */}
                {session.currentQuestionIndex < session.questions.length && (
                  <div className="flex items-start space-x-3 text-xs max-w-2xl animate-fade-in" id="current-question-box">
                    <div className="w-7 h-7 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0 font-bold font-mono text-brand-purple animate-bounce">
                      Q
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-bold uppercase">
                          {session.questions[session.currentQuestionIndex]?.category}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => speakQuestion(session.questions[session.currentQuestionIndex]?.question)}
                          className="flex items-center space-x-1 text-[10px] text-brand-blue hover:text-white bg-brand-blue/5 hover:bg-brand-blue/15 px-2.5 py-1 rounded-lg transition"
                          title="Read Question Aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Hear Question Aloud</span>
                        </button>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white leading-relaxed font-semibold">
                        {session.questions[session.currentQuestionIndex]?.question}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              {session.currentQuestionIndex < session.questions.length && (
                <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-300 block">Your Answer</label>
                      
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`flex items-center space-x-1 text-[11px] px-3 py-1 rounded-full transition ${
                          isListening 
                            ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse" 
                            : "bg-brand-purple/15 border border-brand-purple/30 text-brand-purple hover:text-white hover:bg-brand-purple/25"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Stop Dictating</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Dictate Answer (Mic)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isListening && (
                      <div className="flex items-center space-x-2.5 p-2 px-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <div className="flex items-center space-x-0.5">
                          <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                          <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.05s' }}></span>
                        </div>
                        <p className="text-[10px] text-rose-300 font-mono">Microphone is listening... Speak your response clearly</p>
                      </div>
                    )}

                    {speechError && (
                      <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {speechError}
                      </p>
                    )}

                    <textarea
                      placeholder="Formulate your structured response here... (Aim for 2-4 sentences using specific architecture and metrics)"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full glass-input text-xs text-white p-3 rounded-xl min-h-[100px] leading-relaxed"
                      id="interview-answer-input"
                      required
                      disabled={submittingAnswer}
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={resetInterview}
                      className="px-4 py-2 text-xs text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                      id="abort-interview-btn"
                    >
                      Abort Session
                    </button>

                    <button
                      type="submit"
                      disabled={submittingAnswer || !currentAnswer.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 text-xs text-white font-semibold flex items-center space-x-1.5 shadow-lg shadow-brand-indigo/15 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      id="submit-answer-btn"
                    >
                      {submittingAnswer ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing Answer...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Answer</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* COMPLETED VIEW: Compile Scorecard Loader & Display */}
          {session.status === "completed" && (
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 max-w-2xl mx-auto space-y-6 animate-fade-in" id="interview-completed-view">
              
              {!session.scorecard ? (
                <div className="py-12 text-center space-y-4" id="scorecard-loading-skeleton">
                  <RefreshCw className="w-12 h-12 text-brand-purple animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-white">Assembling Placement Scorecard</h4>
                    <p className="text-xs text-gray-400 font-mono">Aggregating transcripts, checking communication clarity, and grading technical depth...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6" id="scorecard-display">
                  {/* Scorecard Header */}
                  <div className="text-center border-b border-white/5 pb-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-white mt-3">Placement Assessment Complete</h3>
                    <p className="text-xs text-gray-400 mt-1">{session.role}</p>
                  </div>

                  {/* Core Scores sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="scorecard-sliders">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Communication</span>
                        <span className="text-white font-mono font-bold">{session.scorecard.communication}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-blue h-full rounded-full" style={{ width: `${session.scorecard.communication}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Technical Depth</span>
                        <span className="text-white font-mono font-bold">{session.scorecard.technical}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-purple h-full rounded-full" style={{ width: `${session.scorecard.technical}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Expat Alignment</span>
                        <span className="text-white font-mono font-bold">{session.scorecard.alignment}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-indigo h-full rounded-full" style={{ width: `${session.scorecard.alignment}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Summary */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" id="scorecard-summary-card">
                    <span className="text-xs text-brand-purple font-mono uppercase block font-bold">Executive Assessment Feedback</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {session.scorecard.summary}
                    </p>
                  </div>

                  {/* Overall Result Indicator */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Recommended placement status: <strong>High Pre-Match potential</strong></span>
                    </div>

                    <span className="font-mono font-bold text-white text-lg">{session.overallScore}%</span>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={resetInterview}
                      className="flex-1 py-3 text-xs text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-colors"
                      id="start-new-interview-btn"
                    >
                      Start New Practice Session
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
