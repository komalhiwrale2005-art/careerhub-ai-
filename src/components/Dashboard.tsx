import { LayoutDashboard, CheckCircle, Clock, Calendar, Sparkles, Trophy, Plus, ChevronRight, Briefcase, FileCheck, Award, MessageCircle } from "lucide-react";
import { Application } from "../types";

interface DashboardProps {
  applications: Application[];
  userScore: number;
  setActiveTab: (tab: string) => void;
  onSetSelectedJobById: (id: string) => void;
}

export default function Dashboard({ applications, userScore, setActiveTab, onSetSelectedJobById }: DashboardProps) {
  // Stats calculations
  const totalApps = applications.length;
  const interviewingCount = applications.filter(app => app.status === "Interviewing").length;
  const offersCount = applications.filter(app => app.status === "Offer").length;

  // Static target goals for the expat roadmap
  const milestones = [
    { name: "Optimize Resume ATS score (Aim > 80)", current: userScore, target: 80, completed: userScore >= 80, unit: "pts", desc: "Unlock fast-track EU Blue Card & H1B pre-matching algorithms." },
    { name: "Mock Interview Certification", current: 2, target: 3, completed: false, unit: "sessions", desc: "Demonstrate cross-cultural technical leadership competence." },
    { name: "Verified Visa Eligibility Checked", current: 1, target: 1, completed: true, unit: "valid", desc: "Confirmation of passive passport and degree equivalency documents." }
  ];

  const handleJobStrategyClick = (jobId: string) => {
    onSetSelectedJobById(jobId);
    setActiveTab("job-strategy");
  };

  return (
    <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8 pb-24" id="dashboard-container">
      
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-header">
        <div>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-white flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2 text-brand-purple" />
            Candidate Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">Real-time status of your international job applications, immigration checks, and AI coaching indices</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab("search")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo text-xs text-white font-semibold flex items-center space-x-1 hover:opacity-90 hover:scale-102 transition-all"
            id="dash-browse-jobs-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Search Global Roles</span>
          </button>
        </div>
      </div>

      {/* CORE STATS BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-mono">My Global Score</p>
            <p className="text-2xl font-display font-bold text-white font-mono">{userScore}%</p>
            <p className="text-[10px] text-brand-blue font-semibold">Matched Prerequisites</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-brand-blue" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-mono">Active Applications</p>
            <p className="text-2xl font-display font-bold text-white font-mono">{totalApps}</p>
            <p className="text-[10px] text-gray-400">Sent to Immigration Leads</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-brand-indigo" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-mono">Active Interviews</p>
            <p className="text-2xl font-display font-bold text-white font-mono">{interviewingCount}</p>
            <p className="text-[10px] text-brand-purple font-semibold animate-pulse">Live Prep Required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-brand-purple" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-mono">Offers Secured</p>
            <p className="text-2xl font-display font-bold text-emerald-400 font-mono">{offersCount}</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Relocation Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-content-layout">
        
        {/* LEFT COLUMN: ACTIVE PIPELINE & MILESTONES */}
        <div className="lg:col-span-8 space-y-6" id="dashboard-left-column">
          
          {/* Timeline Pipeline */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4" id="applications-pipeline-panel">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-display font-semibold text-sm text-white">Active Relocation Pipeline</h3>
              <span className="text-[10px] text-gray-400 font-mono">LATEST SYNCHRONIZATION: TODAY</span>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center space-y-3" id="pipeline-empty-state">
                <p className="text-xs text-gray-400 font-mono">YOUR RECRUITING TIMELINE IS EMPTY</p>
                <p className="text-xs text-gray-300 max-w-sm mx-auto font-light">
                  Your applied jobs will automatically seed here. Browse roles to begin your relocation journey.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors"
                  id="dash-start-searching-btn"
                >
                  Start Applying
                </button>
              </div>
            ) : (
              <div className="space-y-6" id="applications-timeline-list">
                {applications.map((app) => {
                  let statusBg = "bg-blue-500/10 text-brand-blue border-brand-blue/20";
                  if (app.status === "Interviewing") statusBg = "bg-purple-500/10 text-brand-purple border-brand-purple/20";
                  if (app.status === "Offer") statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4"
                      id={`app-item-${app.id}`}
                    >
                      {/* App Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${app.logoBg} flex items-center justify-center text-white font-mono font-bold text-xs`}>
                            {app.company[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-white leading-none">{app.jobTitle}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">{app.company} • Applied on {app.appliedDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${statusBg}`}>
                            {app.status}
                          </span>
                          <button
                            onClick={() => handleJobStrategyClick(app.jobId)}
                            className="text-[10px] px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-mono flex items-center space-x-0.5"
                            id={`view-prep-btn-${app.id}`}
                          >
                            <span>Strategy Guide</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* App Timeline visualizer */}
                      <div className="grid grid-cols-4 gap-2 pt-2 relative" id={`app-timeline-visual-${app.id}`}>
                        {app.timeline.map((step, sIdx) => {
                          const isPastOrCurrent = 
                            step.completed || 
                            (app.status === "Applied" && sIdx === 0) ||
                            (app.status === "Reviewing" && sIdx <= 1) ||
                            (app.status === "Interviewing" && sIdx <= 2) ||
                            (app.status === "Offer" && sIdx <= 3);

                          return (
                            <div key={sIdx} className="space-y-1.5 text-center">
                              <div className="relative flex items-center justify-center">
                                {/* Line connector */}
                                {sIdx < 3 && (
                                  <div className={`absolute left-1/2 right-[-50%] top-1/2 -translate-y-1/2 h-[2px] z-0 ${
                                    isPastOrCurrent && app.timeline[sIdx+1]?.completed ? "bg-brand-blue/60" : "bg-white/5"
                                  }`} />
                                )}
                                
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] z-10 border transition-all duration-500 ${
                                  isPastOrCurrent 
                                    ? "bg-brand-blue border-brand-blue text-white font-bold" 
                                    : "bg-brand-deep border-white/10 text-gray-500"
                                }`}>
                                  {step.completed ? "✓" : sIdx + 1}
                                </div>
                              </div>
                              <div>
                                <p className={`text-[9px] font-semibold leading-tight line-clamp-1 ${
                                  isPastOrCurrent ? "text-white" : "text-gray-500"
                                }`}>
                                  {step.stage}
                                </p>
                                <p className="text-[8px] text-gray-400 font-mono leading-none mt-0.5">{step.date}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expat Roadmaps & Milestones */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4" id="expat-roadmaps-panel">
            <h3 className="font-display font-semibold text-sm text-white flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-brand-purple animate-pulse" />
              Expat Fast-Track Milestones
            </h3>
            <p className="text-xs text-gray-400">Complete these critical goals to maximize sponsorship processing speed and secure relocation sponsorship clearance.</p>

            <div className="space-y-4 pt-2" id="milestones-progress-list">
              {milestones.map((mil, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white flex items-center">
                        {mil.completed && <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />}
                        {mil.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-light">{mil.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded shrink-0">
                      {mil.current}/{mil.target} {mil.unit}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-blue to-brand-purple h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (mil.current / mil.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI CAREER COACH ASSISTANT */}
        <div className="lg:col-span-4 space-y-6" id="dashboard-right-column">
          <div className="glass-panel rounded-2xl p-6 border border-brand-purple/10 bg-gradient-to-b from-brand-purple/[0.04] to-transparent space-y-4" id="dashboard-ai-assistant">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-display font-semibold text-sm text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-brand-purple" />
                AI Career Strategist
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">Active</span>
            </div>

            <div className="space-y-4" id="ai-coaching-tips">
              <div className="p-3.5 rounded-xl bg-brand-deep/50 border border-white/5 text-xs text-gray-300 leading-relaxed font-light">
                Greetings Komal! Based on your current stats, you are well-positioned for international placement, but optimizing your profile yields:
              </div>

              <div className="space-y-3">
                <div 
                  onClick={() => setActiveTab("ai-center")}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-purple/30 transition-all cursor-pointer space-y-1 group"
                  id="dash-tip-ats"
                >
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Target: ATS Resume score</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </p>
                  <p className="text-[11px] text-gray-400">Your resume is at {userScore}%. Elevate above 80% to access premium automated Fast-Track pre-matches in the EU.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("ai-center")}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-purple/30 transition-all cursor-pointer space-y-1 group"
                  id="dash-tip-mock"
                >
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Ace Technical Panels</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </p>
                  <p className="text-[11px] text-gray-400">Complete one additional Mock Interview session to earn your &apos;Immigration Technical Clearance&apos; badge.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("search")}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-purple/30 transition-all cursor-pointer space-y-1 group"
                  id="dash-tip-search"
                >
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Apply to Tokyo Tech GenomX</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </p>
                  <p className="text-[11px] text-gray-400">Your profile has a 94% matching index with the Senior AI Research position. Apply to bypass entry screenings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
