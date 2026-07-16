import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Bot, User, Send, Mic, MicOff, Volume2, RefreshCw, 
  Search, MapPin, Compass, BookOpen, Terminal, Trash2, AlertCircle, 
  HelpCircle, ChevronRight, Sliders, Info, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy, onSnapshot, deleteDoc, serverTimestamp } from "firebase/firestore";

interface AIAssistantProps {
  userScore: number;
}

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  groundingLinks?: { title: string; uri: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  role: string;
  updatedAt: any;
}

const CHAT_ROLES = [
  {
    id: "expat-advisor",
    name: "Global Expat Advisor",
    icon: Compass,
    description: "Expert in relocations, visa sponsorships, international cost of living, and regional tech hubs.",
    systemInstruction: "You are Global Career Hub's elite Global Expat Advisor. Your objective is to assist candidates with international relocations, work visas (such as H-1B, EU Blue Card, Singapore EP, HSM Switzerland), regional housing markets, and tax implications. Provide clear, precise, up-to-date guidance with a professional, worldly, and helpful tone.",
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: "ats-recruiter",
    name: "ATS Recruiter & Career Strategist",
    icon: BookOpen,
    description: "Specialist in tailoring resumes, strategic application bypasses, and keyword optimization.",
    systemInstruction: "You are an AI Applicant Tracking System (ATS) Expert and Executive Recruiter. Your goal is to guide users in modifying their resumes, matching technical keywords, and planning application strategies to bypass gatekeepers. Focus on STAR methodologies, action verbs, and sponsorship-friendly wording.",
    color: "from-purple-500 to-indigo-400"
  },
  {
    id: "tech-architect",
    name: "Tech Interview Architect",
    icon: Terminal,
    description: "Deep-dives into system designs, low-latency microservices, and specialized engineering stacks.",
    systemInstruction: "You are the Technical Interview Architect. You conduct deep-dives into high-concurrency architectures, system design patterns, distributed databases, CUDA optimization, and cloud services (AWS/GCP). Ask sharp, technical follow-up questions and provide detailed feedback on code and engineering trade-offs.",
    color: "from-emerald-500 to-teal-400"
  }
];

export default function AIAssistant({ userScore }: AIAssistantProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<"chat" | "voice">("chat");

  // Authentication status loading
  const [authLoading, setAuthLoading] = useState(true);

  // CHATBOT STATES
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(CHAT_ROLES[0]);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // VOICE CHAT (LIVE API) STATES
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [voiceConnecting, setVoiceConnecting] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceMessages, setVoiceMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [liveVisualizerActive, setLiveVisualizerActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Track state changes to load geolocation
  useEffect(() => {
    if (useMaps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable:", error);
          // Fallback to London, UK coordinates
          setUserLocation({ latitude: 51.5074, longitude: -0.1278 });
        }
      );
    }
  }, [useMaps]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch chats from firestore if authenticated
  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats: ChatSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedChats.push({
          id: doc.id,
          title: data.title || "Untitled Chat",
          role: data.role || "expat-advisor",
          updatedAt: data.updatedAt
        });
      });
      setChats(fetchedChats);

      // Select first chat if none selected
      if (fetchedChats.length > 0 && !activeChatId) {
        setActiveChatId(fetchedChats[0].id);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }

    const docRef = doc(db, "chats", activeChatId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const roleData = CHAT_ROLES.find(r => r.id === data.role);
        if (roleData) {
          setSelectedRole(roleData);
        }
        if (data.messages) {
          const formattedMsgs: Message[] = data.messages.map((m: any) => ({
            id: m.id || String(Math.random()),
            role: m.role,
            text: m.text,
            timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp),
            groundingLinks: m.groundingLinks || []
          }));
          setMessages(formattedMsgs);
        }
      }
    });

    return () => unsubscribe();
  }, [activeChatId, user]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatLoading]);

  // Handle SignIn / SignOut
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("SignOut error:", error);
    }
  };

  // Create a new chat session
  const createNewChat = async (roleId: string = "expat-advisor") => {
    if (!user) return;
    const roleObj = CHAT_ROLES.find(r => r.id === roleId) || CHAT_ROLES[0];
    try {
      const docRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        title: `Discussion with ${roleObj.name}`,
        role: roleId,
        messages: [],
        updatedAt: serverTimestamp()
      });
      setActiveChatId(docRef.id);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };

  // Delete chat session
  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, "chats", id));
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");
    setChatLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: new Date()
    };

    let chatSessionId = activeChatId;
    let localMessages = [...messages, userMsg];

    // If not authenticated, we'll keep transient offline chat
    if (!user) {
      setMessages(localMessages);
    } else {
      // If no active chat, create one
      if (!chatSessionId) {
        try {
          const docRef = await addDoc(collection(db, "chats"), {
            userId: user.uid,
            title: userText.length > 30 ? `${userText.slice(0, 30)}...` : userText,
            role: selectedRole.id,
            messages: [],
            updatedAt: serverTimestamp()
          });
          chatSessionId = docRef.id;
          setActiveChatId(docRef.id);
        } catch (err) {
          console.error("Failed to dynamically create chat:", err);
          setChatLoading(false);
          return;
        }
      }

      // Add user message to firestore
      const docRef = doc(db, "chats", chatSessionId);
      try {
        await setDoc(docRef, {
          userId: user.uid,
          title: localMessages[0]?.text.slice(0, 32) || "Discussion",
          role: selectedRole.id,
          messages: localMessages.map(m => ({
            id: m.id,
            role: m.role,
            text: m.text,
            timestamp: m.timestamp,
            groundingLinks: m.groundingLinks || []
          })),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error saving user message to Firestore:", err);
      }
    }

    try {
      // Format messages into Gemini-compatible payload
      const payloadMessages = localMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          systemInstruction: selectedRole.systemInstruction,
          useSearch: useSearch && selectedModel === "gemini-3.5-flash",
          useMaps: useMaps && selectedModel === "gemini-3.5-flash",
          location: userLocation
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Parse grounding metadata links
      const links: { title: string; uri: string }[] = [];
      const chunks = data.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            links.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri
            });
          } else if (chunk.maps?.uri) {
            links.push({
              title: chunk.maps.title || "Google Maps Location",
              uri: chunk.maps.uri
            });
          }
        });
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date(),
        groundingLinks: links
      };

      const finalMessages = [...localMessages, botMsg];

      if (!user) {
        setMessages(finalMessages);
      } else if (chatSessionId) {
        const docRef = doc(db, "chats", chatSessionId);
        await setDoc(docRef, {
          userId: user.uid,
          title: finalMessages[0]?.text.slice(0, 32) || "Discussion",
          role: selectedRole.id,
          messages: finalMessages.map(m => ({
            id: m.id,
            role: m.role,
            text: m.text,
            timestamp: m.timestamp,
            groundingLinks: m.groundingLinks || []
          })),
          updatedAt: serverTimestamp()
        });
      }

    } catch (err: any) {
      console.error("Gemini chatbot error:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "model",
        text: `Error interacting with Gemini: ${err.message || "Failed to reach AI server."}. If using high-capacity models like gemini-3.1-pro-preview, verify billing is enabled or check Settings > Secrets.`,
        timestamp: new Date()
      };
      setMessages([...localMessages, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // FLOAT TO 16-BIT PCM ENCODING
  const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64To16BitPCM = (base64: string): Int16Array => {
    const binary = window.atob(base64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Int16Array(buffer);
  };

  const pcmToFloat32 = (pcm16: Int16Array): Float32Array => {
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }
    return float32;
  };

  // LIVE API SOUND WAVE VISUALIZER TRIGGER
  useEffect(() => {
    if (voiceConnected) {
      setLiveVisualizerActive(true);
    } else {
      setLiveVisualizerActive(false);
    }
  }, [voiceConnected]);

  // CONNECT LIVE VOICE SESSION
  const startVoiceSession = async () => {
    setVoiceError("");
    setVoiceConnecting(true);
    setVoiceMessages([]);

    try {
      // 1. Establish microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Initialize input AudioContext (16kHz for Live API capture)
      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = new AudioContext({ sampleRate: 24000 }); // Output contexts
      nextStartTimeRef.current = 0;

      // 3. Setup websocket connection to server proxy
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Live voice proxy connection established");
        setVoiceConnecting(false);
        setVoiceConnected(true);
        setVoiceMessages([{ text: "Connection online. Speak freely!", sender: "bot" }]);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setVoiceError(msg.error);
            stopVoiceSession();
          }

          if (msg.audio && audioContextRef.current) {
            const pcm16 = base64To16BitPCM(msg.audio);
            const float32 = pcmToFloat32(pcm16);
            
            const audioCtx = audioContextRef.current;
            if (audioCtx.state === "suspended") {
              audioCtx.resume();
            }

            const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);

            const currentTime = audioCtx.currentTime;
            if (nextStartTimeRef.current < currentTime) {
              nextStartTimeRef.current = currentTime;
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
          }

          if (msg.interrupted) {
            console.log("Audio stream interrupted by user speak");
            // Clear future playback slots
            if (audioContextRef.current) {
              nextStartTimeRef.current = audioContextRef.current.currentTime;
            }
          }
        } catch (err) {
          console.error("Error parsing websocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("Live WS closed");
        stopVoiceSession();
      };

      ws.onerror = (err) => {
        console.error("Live WS error:", err);
        setVoiceError("WebSocket server connectivity dropped.");
        stopVoiceSession();
      };

      // 4. Capture microphone and push PCM
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        const pcm16Buffer = floatTo16BitPCM(float32);
        const base64 = arrayBufferToBase64(pcm16Buffer);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };

    } catch (err: any) {
      console.error("Microphone or WebSocket connection failed:", err);
      setVoiceError(err.message || "Failed to initialize audio devices.");
      setVoiceConnecting(false);
      stopVoiceSession();
    }
  };

  // DISCONNECT LIVE VOICE SESSION
  const stopVoiceSession = () => {
    // Stop recording mic
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    // Close websocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    // Close AudioContexts
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    setVoiceConnected(false);
    setVoiceConnecting(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col h-[calc(100vh-4rem)] relative" id="assistant-root">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-4 gap-4" id="assistant-header">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            <span>Aetheric Assistant & Voice AI</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Securely synchronized to your profile. Engage specialized advisors or conduct vocal practices in real-time.
          </p>
        </div>

        {/* Workspace Toggles and Sign-In Banner */}
        <div className="flex items-center space-x-3 w-full md:w-auto" id="assistant-actions">
          {authLoading ? (
            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
          ) : !user ? (
            <button
              onClick={handleSignIn}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-brand-deep hover:bg-gray-100 transition shadow-lg flex items-center space-x-1.5"
              id="google-signin-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign-In (Sync Profile)</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2" id="user-info-badge">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>SYNCED: {user.displayName || "Active User"}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                title="Sign Out"
                id="google-signout-btn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
            <button
              onClick={() => setActiveWorkspace("chat")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeWorkspace === "chat" ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" : "text-gray-400 hover:text-white"
              }`}
              id="toggle-chat-workspace"
            >
              Consulting Chat
            </button>
            <button
              onClick={() => {
                setActiveWorkspace("voice");
                if (voiceConnected) stopVoiceSession();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeWorkspace === "voice" ? "bg-brand-indigo text-white shadow-md shadow-brand-indigo/20" : "text-gray-400 hover:text-white"
              }`}
              id="toggle-voice-workspace"
            >
              Live Voice AI
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0" id="assistant-workspace-grid">
        
        {/* LEFT COLUMN: Sidebar (Chat lists, configurations) */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0" id="assistant-sidebar-config">
          
          {activeWorkspace === "chat" ? (
            <div className="glass-panel rounded-2xl border border-white/5 p-4 flex flex-col h-full space-y-4 min-h-0" id="chat-management-sidebar">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-brand-purple font-mono font-bold">Past Conversations</span>
                {user && (
                  <button
                    onClick={() => createNewChat(selectedRole.id)}
                    className="p-1 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition"
                    title="Start New Discussion"
                    id="new-chat-btn"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Chat threads list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar" id="chat-sessions-list">
                {!user ? (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-center space-y-2">
                    <Info className="w-5 h-5 text-gray-500 mx-auto" />
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Sign in to persist your discussions, customize roles, and sync your resume scorecard dynamically!
                    </p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-center space-y-2">
                    <HelpCircle className="w-5 h-5 text-gray-500 mx-auto" />
                    <button
                      onClick={() => createNewChat(selectedRole.id)}
                      className="text-[11px] text-brand-purple hover:underline"
                    >
                      Create your first session
                    </button>
                  </div>
                ) : (
                  chats.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChatId(ch.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left group transition ${
                        activeChatId === ch.id 
                          ? "bg-brand-purple/10 border-brand-purple/30 text-white shadow-lg shadow-brand-purple/5" 
                          : "bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      id={`chat-session-item-${ch.id}`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Bot className="w-3.5 h-3.5 flex-shrink-0 text-brand-purple" />
                        <span className="text-[11px] font-medium truncate leading-none">{ch.title}</span>
                      </div>
                      <button
                        onClick={(e) => deleteChat(ch.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-rose-400 transition"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>

              {/* Chat parameters */}
              <div className="border-t border-white/5 pt-4 space-y-3" id="chatbot-params-panel">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Consulting Specialist</label>
                  <select
                    value={selectedRole.id}
                    onChange={(e) => {
                      const found = CHAT_ROLES.find(r => r.id === e.target.value);
                      if (found) {
                        setSelectedRole(found);
                        if (user && activeChatId) {
                          // update role in DB
                          setDoc(doc(db, "chats", activeChatId), { role: found.id }, { merge: true });
                        }
                      }
                    }}
                    className="w-full text-xs text-white glass-input p-2 rounded-lg bg-brand-deep border border-white/5 outline-none focus:border-brand-purple/50"
                    id="role-select"
                  >
                    {CHAT_ROLES.map(r => (
                      <option key={r.id} value={r.id} className="bg-brand-deep text-slate-200">{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Model Capacity</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full text-xs text-white glass-input p-2 rounded-lg bg-brand-deep border border-white/5 outline-none focus:border-brand-purple/50"
                    id="model-select"
                  >
                    <option value="gemini-3.5-flash" className="bg-brand-deep text-slate-200">gemini-3.5-flash (Standard & Tools)</option>
                    <option value="gemini-3.1-pro-preview" className="bg-brand-deep text-slate-200">gemini-3.1-pro-preview (Complex Tasks)</option>
                    <option value="gemini-3.1-flash-lite" className="bg-brand-deep text-slate-200">gemini-3.1-flash-lite (Fastest Responses)</option>
                  </select>
                </div>

                {/* Grounding toggles (available only for gemini-3.5-flash) */}
                {selectedModel === "gemini-3.5-flash" && (
                  <div className="space-y-2 pt-2 border-t border-white/5" id="grounding-toggles">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Search className="w-3.5 h-3.5 text-brand-blue" />
                        <span className="text-[10px] text-gray-300">Google Search Grounding</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useSearch}
                        onChange={(e) => {
                          setUseSearch(e.target.checked);
                          if (e.target.checked) setUseMaps(false);
                        }}
                        className="rounded accent-brand-blue bg-white/5 border-white/10"
                        id="search-grounding-toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-purple" />
                        <span className="text-[10px] text-gray-300">Google Maps Grounding</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useMaps}
                        onChange={(e) => {
                          setUseMaps(e.target.checked);
                          if (e.target.checked) setUseSearch(false);
                        }}
                        className="rounded accent-brand-purple bg-white/5 border-white/10"
                        id="maps-grounding-toggle"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/5 p-4 flex flex-col h-full space-y-4" id="voice-settings-sidebar">
              <span className="text-[11px] uppercase tracking-wider text-brand-indigo font-mono font-bold">Voice Assistant Status</span>
              
              <div className="flex-1 space-y-4" id="voice-status-info">
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${voiceConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-white font-semibold font-mono">
                      {voiceConnected ? "ONLINE" : voiceConnecting ? "DIALING..." : "OFFLINE"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Connects directly to <strong className="text-slate-200">gemini-3.1-flash-live-preview</strong> via server-side secure WS proxy. Output synthesized at 24kHz.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-brand-indigo/5 border border-brand-indigo/10 space-y-2">
                  <div className="flex items-center space-x-1.5 text-brand-indigo">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase font-mono">Adaptive Tuning</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    This model is fully responsive to micro-interrupts. Simply start speaking while the AI is replying, and the synthesis stream will cut off immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Active Workspace Window */}
        <div className="lg:col-span-9 flex flex-col min-h-0" id="assistant-workspace-window">
          
          {activeWorkspace === "chat" ? (
            <div className="glass-panel rounded-2xl border border-white/5 flex flex-col h-full min-h-0" id="chatbot-workspace">
              
              {/* Role Header */}
              <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between" id="chatbot-role-header">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-tr ${selectedRole.color} text-white shadow-md`}>
                    <selectedRole.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{selectedRole.name}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed max-w-xl">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-[9px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400 uppercase">
                    ATS Score Bias: {userScore}%
                  </span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar" id="chat-messages-container">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4" id="chat-empty-state">
                    <Bot className="w-12 h-12 text-brand-purple opacity-30 animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white">Discussion Thread Ready</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Say Hello to your specialist! If you are signed in, your dialogue session will sync to Firestore in real-time.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div className={`flex space-x-2.5 max-w-[85%] ${m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          m.role === "user" ? "bg-brand-purple text-white" : "bg-white/10 text-gray-300"
                        }`}>
                          {m.role === "user" ? "U" : "AI"}
                        </div>
                        <div className="space-y-1.5">
                          <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            m.role === "user" 
                              ? "bg-brand-purple text-white rounded-tr-none" 
                              : "bg-white/[0.02] border border-white/5 text-gray-100 rounded-tl-none font-light"
                          }`}>
                            <p className="whitespace-pre-wrap">{m.text}</p>
                          </div>

                          {/* Grounding metadata links */}
                          {m.groundingLinks && m.groundingLinks.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1" id="message-grounding-links">
                              {m.groundingLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-medium transition border border-blue-500/20"
                                >
                                  {useMaps ? <MapPin className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                                  <span className="truncate max-w-[120px]">{link.title}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          <span className="text-[9px] text-gray-500 font-mono block pl-1">
                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start items-center space-x-2.5" id="chat-loading-skeleton">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-300">
                      AI
                    </div>
                    <div className="flex items-center space-x-1.5 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-2xl rounded-tl-none text-xs text-gray-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini is compiling advice...</span>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center gap-3" id="chatbot-form">
                <input
                  type="text"
                  placeholder={`Consult ${selectedRole.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 glass-input p-3 rounded-xl text-xs text-white outline-none focus:border-brand-purple/50 bg-brand-deep border border-white/5"
                  disabled={chatLoading}
                  id="chatbot-text-input"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputMessage.trim()}
                  className="p-3 bg-brand-purple hover:bg-brand-purple-hover disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl transition shadow-lg shadow-brand-purple/20"
                  id="chatbot-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/5 flex flex-col h-full min-h-0 p-6 md:p-8 justify-center items-center relative overflow-hidden" id="live-voice-workspace">
              
              {/* Decorative radial pulsing ring for active state */}
              {liveVisualizerActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[300px] h-[300px] rounded-full bg-brand-indigo/10 border border-brand-indigo/20 animate-ping opacity-60"></div>
                  <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-indigo/5 border border-brand-indigo/15 animate-ping opacity-30"></div>
                </div>
              )}

              <div className="text-center space-y-6 max-w-md relative z-10" id="live-voice-controls">
                
                {/* Voice Icon Display */}
                <div className="relative mx-auto flex items-center justify-center">
                  <button
                    onClick={voiceConnected ? stopVoiceSession : startVoiceSession}
                    disabled={voiceConnecting}
                    className={`w-28 h-28 rounded-full border flex items-center justify-center transition-all duration-300 shadow-2xl ${
                      voiceConnected
                        ? "bg-brand-indigo/20 border-brand-indigo/50 text-brand-indigo scale-105 shadow-brand-indigo/35 animate-pulse"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    id="live-voice-mic-trigger"
                  >
                    {voiceConnecting ? (
                      <RefreshCw className="w-10 h-10 animate-spin text-brand-indigo" />
                    ) : voiceConnected ? (
                      <Mic className="w-10 h-10" />
                    ) : (
                      <MicOff className="w-10 h-10" />
                    )}
                  </button>

                  {/* Interrupt prompt overlay */}
                  {voiceConnected && (
                    <span className="absolute -bottom-4 bg-brand-indigo text-[10px] font-bold font-mono px-2.5 py-1 rounded-full text-white shadow-lg animate-fade-in shadow-brand-indigo/20">
                      MICROPHONE ACTIVE
                    </span>
                  )}
                </div>

                {/* Description texts */}
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-white">
                    {voiceConnected ? "AI Expat Conversation Active" : voiceConnecting ? "Establishing Live Gateway" : "Start Oral Interview Prep"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    {voiceConnected 
                      ? "Speak clearly. The model will reply with natural, low-latency audio. Say whatever is on your mind or request interview practices."
                      : "Click the microphone to connect. This launches a raw 16-bit PCM duplex audio streaming pipeline."
                    }
                  </p>
                </div>

                {/* Error Banner */}
                {voiceError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-mono flex items-center justify-center gap-2" id="voice-error-alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-4" id="voice-activation-buttons">
                  {!voiceConnected ? (
                    <button
                      onClick={startVoiceSession}
                      disabled={voiceConnecting}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:scale-[1.01] active:scale-[0.99] transition-all text-xs font-semibold text-white shadow-lg shadow-brand-indigo/15"
                      id="voice-connect-btn"
                    >
                      {voiceConnecting ? "Connecting Live Core..." : "Initiate Live AI Call"}
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceSession}
                      className="px-8 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors text-xs font-semibold text-rose-400"
                      id="voice-disconnect-btn"
                    >
                      Disconnect Call
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Inline fallback component for standard Plus icon
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
