export interface Job {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  logoBg: string;
  location: string;
  country: string;
  visaStatus: "Full Sponsorship" | "Sponsorship Available" | "No Sponsorship";
  relocationSupport: "Full Relocation" | "Flights + Temp Housing" | "None";
  salary: string;
  type: "Full-time" | "Contract" | "Remote";
  category: string;
  experience: "Junior" | "Mid" | "Senior" | "Lead" | "Executive";
  description: string;
  requirements: string[];
  benefits: string[];
  techStack: string[];
  growthTrend: string;
  visaDifficulty: "Low" | "Medium" | "High";
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  logoBg: string;
  status: "Applied" | "Reviewing" | "Interviewing" | "Offer" | "Rejected";
  appliedDate: string;
  notes?: string;
  timeline: {
    stage: string;
    date: string;
    completed: boolean;
  }[];
}

export interface ResumeAnalysisResult {
  score: number;
  category: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  atsKeywords: string[];
}

export interface InterviewQuestion {
  question: string;
  category: "Technical" | "Behavioral" | "Cultural" | "General";
}

export interface MockInterviewSession {
  role: string;
  status: "idle" | "active" | "completed";
  questions: InterviewQuestion[];
  answers: string[];
  feedbacks: string[];
  currentQuestionIndex: number;
  overallScore?: number;
  scorecard?: {
    communication: number;
    technical: number;
    alignment: number;
    summary: string;
  };
}
