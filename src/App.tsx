import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AethericBackground from "./components/AethericBackground";
import LandingPage from "./components/LandingPage";
import JobSearch from "./components/JobSearch";
import Dashboard from "./components/Dashboard";
import JobStrategy from "./components/JobStrategy";
import AIStrategyCenter from "./components/AIStrategyCenter";
import AIAssistant from "./components/AIAssistant";

import { mockJobs } from "./data/mockJobs";
import { Job, Application } from "./types";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, query, where, addDoc } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [userScore, setUserScore] = useState<number>(74); // Initial resume ATS score
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync user profile score
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, "user_profiles", currentUser.uid);
    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (typeof data.userScore === "number") {
          setUserScore(data.userScore);
        }
      } else {
        // Seed default score if not exists
        setDoc(profileRef, {
          userId: currentUser.uid,
          userScore: userScore,
          updatedAt: new Date()
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Sync Applications collection
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "applications"), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbApps: Application[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dbApps.push({
          id: doc.id,
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          company: data.company,
          logoBg: data.logoBg,
          status: data.status,
          appliedDate: data.appliedDate,
          timeline: data.timeline,
          notes: data.notes
        });
      });

      if (dbApps.length > 0) {
        setApplications(dbApps);
      } else {
        // Seed default pre-seeded applications to firestore
        applications.forEach((app) => {
          addDoc(collection(db, "applications"), {
            userId: currentUser.uid,
            ...app
          });
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Global search parameters pre-seeded from landing page
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    country: "",
    category: "",
    visaSponsorship: false
  });

  // Pre-seed some beautiful, realistic applications
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app-1",
      jobId: "job-2",
      jobTitle: "Principal FinTech System Architect",
      company: "FlowNL Payments",
      logoBg: "bg-emerald-600",
      status: "Interviewing",
      appliedDate: "Jul 1, 2026",
      timeline: [
        { stage: "Applied & Bypassed", date: "Jul 1", completed: true },
        { stage: "HR Screening Call", date: "Jul 4", completed: true },
        { stage: "Architecture Panel", date: "Jul 10", completed: true },
        { stage: "Board Alignment", date: "Scheduled", completed: false }
      ]
    },
    {
      id: "app-2",
      jobId: "job-5",
      jobTitle: "Global UX/UI Product Designer",
      company: "NeoSphere Web",
      logoBg: "bg-rose-600",
      status: "Applied",
      appliedDate: "Jul 8, 2026",
      timeline: [
        { stage: "Applied & Bypassed", date: "Jul 8", completed: true },
        { stage: "Recruiter Feedback", date: "In-Progress", completed: false },
        { stage: "Portfolio Defense", date: "Locked", completed: false },
        { stage: "EP Clearance", date: "Locked", completed: false }
      ]
    }
  ]);

  // Handle new job search filter submissions from Landing or Search bar
  const handleSearchFilters = (filters: { query: string; country: string; category: string; visaSponsorship: boolean }) => {
    setSearchFilters(filters);
  };

  // Helper: Select job to view Strategy Deep-dive
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setActiveTab("job-strategy");
  };

  const handleSetSelectedJobById = (jobId: string) => {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  // Helper: Apply directly to a job
  const handleApplyJob = async (job: Job) => {
    // Check if already applied
    if (applications.some(app => app.jobId === job.id)) return;

    const newApp = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      logoBg: job.logoBg,
      status: "Applied" as const,
      appliedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeline: [
        { stage: "Applied & Bypassed", date: "Today", completed: true },
        { stage: "Pre-Sponsorship review", date: "Pending", completed: false },
        { stage: "Technical Screening", date: "Locked", completed: false },
        { stage: "Visa Approval EP", date: "Locked", completed: false }
      ]
    };

    if (currentUser) {
      try {
        await addDoc(collection(db, "applications"), {
          userId: currentUser.uid,
          ...newApp
        });
      } catch (err) {
        console.error("Error applying to job in Firestore:", err);
      }
    } else {
      setApplications([{ id: `app-${Date.now()}`, ...newApp } as Application, ...applications]);
    }
  };

  const mockJobTitles = mockJobs.map(j => j.title);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-brand-purple/30 selection:text-white" id="root-app-layout">
      {/* 1. Procedural Animated Aetheric Particles Background */}
      <AethericBackground />

      {/* 2. Sticky Glassmorphism Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} userScore={userScore} />

      {/* 3. Render Core Content Panels based on Active Navigation Tab */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === "landing" && (
          <LandingPage
            onSearch={handleSearchFilters}
            mockJobs={mockJobs}
            onSelectJob={handleSelectJob}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "search" && (
          <JobSearch
            mockJobs={mockJobs}
            onSelectJob={handleSelectJob}
            onApplyJob={handleApplyJob}
            initialFilters={searchFilters}
          />
        )}

        {activeTab === "dashboard" && (
          <Dashboard
            applications={applications}
            userScore={userScore}
            setActiveTab={setActiveTab}
            onSetSelectedJobById={handleSetSelectedJobById}
          />
        )}

        {activeTab === "job-strategy" && (
          <JobStrategy
            selectedJob={selectedJob}
            mockJobs={mockJobs}
            onSetSelectedJob={setSelectedJob}
            setActiveTab={setActiveTab}
            onApplyJob={handleApplyJob}
          />
        )}

        {activeTab === "ai-center" && (
          <AIStrategyCenter
            userScore={userScore}
            setUserScore={setUserScore}
            mockJobs={mockJobTitles}
          />
        )}

        {activeTab === "ai-assistant" && (
          <AIAssistant userScore={userScore} />
        )}
      </main>

      {/* Background radial soft light blobs for glowing aesthetic depth */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/25 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed top-[20%] right-[10%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
    </div>
  );
}
