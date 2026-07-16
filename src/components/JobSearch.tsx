import React, { useState, useEffect } from "react";
import { 
  Search, MapPin, Building, Briefcase, FileText, Globe, Sparkles, Filter, Check, 
  Plane, X, ChevronRight, Bookmark, Calculator, PiggyBank, Percent, Info, 
  AlertCircle, Share2, Calendar, Trophy, ExternalLink, ShieldCheck, Clock
} from "lucide-react";
import { Job } from "../types";

interface JobSearchProps {
  mockJobs: Job[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  initialFilters: { query: string; country: string; category: string; visaSponsorship: boolean };
}

const parseSalaryBoundaries = (salaryStr: string): { min: number; max: number; average: number } => {
  const nums = salaryStr.replace(/[^0-9-]/g, "").split("-").map(Number);
  const min = nums[0] || 80000;
  const max = nums[1] || Math.round(min * 1.3);
  const average = Math.round((min + max) / 2);
  return { min, max, average };
};

const getCurrencyDetails = (country: string) => {
  switch (country.toLowerCase()) {
    case "japan":
      return { symbol: "¥", name: "JPY", taxRate: 0.22, avgRent: 150000, minRent: 60000, maxRent: 400000, stepRent: 5000, rentLabel: "Monthly Rent & Utilities" };
    case "netherlands":
      return { symbol: "€", name: "EUR", taxRate: 0.36, avgRent: 1800, minRent: 900, maxRent: 3500, stepRent: 50, rentLabel: "Monthly Rent + Utilities" };
    case "germany":
      return { symbol: "€", name: "EUR", taxRate: 0.38, avgRent: 1500, minRent: 700, maxRent: 3000, stepRent: 50, rentLabel: "Monthly Rent (Warm)" };
    case "united kingdom":
      return { symbol: "£", name: "GBP", taxRate: 0.34, avgRent: 2200, minRent: 1000, maxRent: 4500, stepRent: 50, rentLabel: "Monthly Rent + Council Tax" };
    case "singapore":
      return { symbol: "S$", name: "SGD", taxRate: 0.12, avgRent: 3800, minRent: 1800, maxRent: 7500, stepRent: 100, rentLabel: "Condo/Room Monthly Rent" };
    case "switzerland":
      return { symbol: "CHF", name: "CHF", taxRate: 0.16, avgRent: 2300, minRent: 1100, maxRent: 5500, stepRent: 50, rentLabel: "Monthly Rent & Charges" };
    default:
      return { symbol: "$", name: "USD", taxRate: 0.25, avgRent: 2000, minRent: 900, maxRent: 4500, stepRent: 50, rentLabel: "Estimated Rent & Living" };
  }
};

export default function JobSearch({ mockJobs, onSelectJob, onApplyJob, initialFilters }: JobSearchProps) {
  // Filters State
  const [query, setQuery] = useState(initialFilters.query);
  const [country, setCountry] = useState(initialFilters.country);
  const [category, setCategory] = useState(initialFilters.category);
  const [visaSponsorship, setVisaSponsorship] = useState(initialFilters.visaSponsorship);
  const [relocation, setRelocation] = useState("");
  const [experience, setExperience] = useState("");
  const [viewSavedOnly, setViewSavedOnly] = useState(false);
  
  // App-wide state links
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [isApplyingJob, setIsApplyingJob] = useState<Job | null>(null);
  const [applyNotes, setApplyNotes] = useState("");

  // Active Job detail side-pane state
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [detailTab, setDetailTab] = useState<"details" | "calculator" | "roadmap">("details");

  // Expat Calculator states linked to activeJob
  const [salaryValue, setSalaryValue] = useState<number>(100000);
  const [housingValue, setHousingValue] = useState<number>(2000);
  const [applyExpatRuling, setApplyExpatRuling] = useState<boolean>(true);
  const [salaryBounds, setSalaryBounds] = useState({ min: 80000, max: 120000, average: 100000 });

  // Sync state with incoming initialFilters
  useEffect(() => {
    setQuery(initialFilters.query);
    setCountry(initialFilters.country);
    setCategory(initialFilters.category);
    setVisaSponsorship(initialFilters.visaSponsorship);
    setViewSavedOnly(false);
  }, [initialFilters]);

  // Set default active job on list change or initial load
  useEffect(() => {
    const matched = getFilteredJobs();
    if (matched.length > 0) {
      if (!activeJob || !matched.some(j => j.id === activeJob.id)) {
        handleJobClick(matched[0]);
      }
    } else {
      setActiveJob(null);
    }
  }, [query, country, category, visaSponsorship, relocation, experience, viewSavedOnly]);

  // Helper when clicking a job card
  const handleJobClick = (job: Job) => {
    setActiveJob(job);
    const bounds = parseSalaryBoundaries(job.salary);
    setSalaryBounds(bounds);
    setSalaryValue(bounds.average);
    
    const details = getCurrencyDetails(job.country);
    setHousingValue(details.avgRent);
    setApplyExpatRuling(job.country.toLowerCase() === "netherlands");
  };

  // Toggle saving a job
  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedJobIds.includes(id)) {
      setSavedJobIds(savedJobIds.filter(savedId => savedId !== id));
    } else {
      setSavedJobIds([...savedJobIds, id]);
    }
  };

  // Filter core logic
  const getFilteredJobs = () => {
    return mockJobs.filter((job) => {
      if (viewSavedOnly && !savedJobIds.includes(job.id)) return false;

      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.techStack.some(tech => tech.toLowerCase().includes(query.toLowerCase()));

      const matchesCountry = !country || job.country.toLowerCase() === country.toLowerCase();
      const matchesCategory = !category || job.category.toLowerCase() === category.toLowerCase();
      
      const matchesVisa =
        !visaSponsorship ||
        job.visaStatus === "Full Sponsorship" ||
        job.visaStatus === "Sponsorship Available";

      const matchesRelocation =
        !relocation ||
        (relocation === "full" && job.relocationSupport === "Full Relocation") ||
        (relocation === "any" && job.relocationSupport !== "None");

      const matchesExperience = !experience || job.experience.toLowerCase() === experience.toLowerCase();

      return matchesQuery && matchesCountry && matchesCategory && matchesVisa && matchesRelocation && matchesExperience;
    });
  };

  const filteredJobs = getFilteredJobs();

  const handleApplyClick = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplyingJob(job);
    setApplyNotes("");
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApplyingJob) return;

    onApplyJob(isApplyingJob);
    setAppliedJobs([...appliedJobs, isApplyingJob.id]);
    setIsApplyingJob(null);
  };

  const countries = ["Japan", "Netherlands", "United Kingdom", "Germany", "Singapore", "Canada"];
  const categories = ["Software Engineering", "AI & Data Science", "Product Management", "Creative & Design"];
  const experienceLevels = ["Junior", "Mid", "Senior", "Lead", "Executive"];

  // Expat calculations for active job
  const currency = activeJob ? getCurrencyDetails(activeJob.country) : { symbol: "$", name: "USD", taxRate: 0.25, avgRent: 2000, minRent: 900, maxRent: 4500, stepRent: 50, rentLabel: "Monthly Expenses" };
  const monthlyGross = Math.round(salaryValue / 12);
  
  let effectiveTaxRate = currency.taxRate;
  if (applyExpatRuling && activeJob) {
    if (activeJob.country.toLowerCase() === "netherlands") {
      effectiveTaxRate = currency.taxRate * 0.7; // 30% discount
    } else {
      effectiveTaxRate = currency.taxRate * 0.85; // general discount
    }
  }
  
  const monthlyTax = Math.round(monthlyGross * effectiveTaxRate);
  const monthlyNetTakeHome = monthlyGross - monthlyTax;
  const estimatedOtherExpenses = Math.round(monthlyGross * 0.10) + (activeJob && activeJob.country.toLowerCase() === "japan" ? 40000 : 350);
  const monthlyNetSavings = monthlyNetTakeHome - housingValue - estimatedOtherExpenses;
  const savingsPercentage = monthlyGross > 0 ? (monthlyNetSavings / monthlyGross) * 100 : 0;

  // Custom mock matching percentage for realistic feel
  const getMatchScore = (job: Job) => {
    let base = 72;
    if (job.category.includes("AI") || job.title.includes("AI")) base += 12;
    if (job.techStack.includes("PyTorch") || job.techStack.includes("Go") || job.techStack.includes("Rust")) base += 8;
    if (job.experience === "Senior") base += 4;
    return Math.min(98, base);
  };

  return (
    <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 pb-24" id="search-container">
      
      {/* 1. Google Jobs Inspired Hero & Subtitle */}
      <div id="search-header" className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
            <Globe className="w-4 h-4 text-brand-blue animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">
            Global Careers Explorer
          </h2>
        </div>
        <p className="text-xs text-gray-400 max-w-3xl leading-relaxed">
          Search and match with verified international technology positions featuring full company sponsorship, relocation flights, and real-time take-home salary modeling.
        </p>
      </div>

      {/* 2. Google-Style Sleek Horizontal Search & Filter Console */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3 shadow-xl" id="google-search-console">
        {/* Main Search input bar */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role title, companies, or technologies (e.g., PyTorch, Go, Solutions Architect)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full glass-input text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:ring-1 focus:ring-brand-blue/30"
              id="search-input-box"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-full bg-white/5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => {
              setQuery("");
              setCountry("");
              setCategory("");
              setVisaSponsorship(false);
              setRelocation("");
              setExperience("");
              setViewSavedOnly(false);
            }}
            className="px-4 py-3 text-xs bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 font-medium font-mono uppercase transition"
          >
            Reset
          </button>
        </div>

        {/* Popular Tags / Auto-suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-gray-400">
          <span className="font-mono text-gray-500">Popular:</span>
          {["PyTorch", "Go", "Amsterdam", "Tokyo", "London", "Singapore"].map(tag => (
            <button
              key={tag}
              onClick={() => {
                if (["Amsterdam", "Tokyo", "London", "Singapore"].includes(tag)) {
                  setQuery("");
                  if (tag === "Tokyo") setCountry("Japan");
                  else if (tag === "Amsterdam") setCountry("Netherlands");
                  else if (tag === "London") setCountry("United Kingdom");
                  else if (tag === "Singapore") setCountry("Singapore");
                } else {
                  setQuery(tag);
                }
              }}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 transition"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Dropdown filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-white/5">
          {/* Country */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-500 uppercase block">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-[11px] text-white px-2.5 py-1.5 rounded-lg cursor-pointer focus:ring-1 focus:ring-brand-blue"
            >
              <option value="" className="bg-brand-deep">Any Country</option>
              {countries.map(c => <option key={c} value={c} className="bg-brand-deep">{c}</option>)}
            </select>
          </div>

          {/* Specialization */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-500 uppercase block">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-[11px] text-white px-2.5 py-1.5 rounded-lg cursor-pointer focus:ring-1 focus:ring-brand-blue"
            >
              <option value="" className="bg-brand-deep">All Sectors</option>
              {categories.map(cat => <option key={cat} value={cat} className="bg-brand-deep">{cat}</option>)}
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-500 uppercase block">Min Experience</span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-[11px] text-white px-2.5 py-1.5 rounded-lg cursor-pointer focus:ring-1 focus:ring-brand-blue"
            >
              <option value="" className="bg-brand-deep">All Levels</option>
              {experienceLevels.map(exp => <option key={exp} value={exp.toLowerCase()} className="bg-brand-deep">{exp}</option>)}
            </select>
          </div>

          {/* Visa Sponsorship Filter Switch */}
          <div className="flex items-center justify-between sm:justify-start space-x-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sponsor-only-switch"
                checked={visaSponsorship}
                onChange={(e) => setVisaSponsorship(e.target.checked)}
                className="rounded border-white/10 bg-brand-deep text-brand-purple focus:ring-brand-purple cursor-pointer h-3.5 w-3.5"
              />
              <label htmlFor="sponsor-only-switch" className="text-[10px] text-gray-300 font-medium select-none cursor-pointer flex items-center">
                Sponsor Only
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 animate-ping" />
              </label>
            </div>
          </div>

          {/* Saved Jobs Filter Switch */}
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start space-x-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saved-only-switch"
                checked={viewSavedOnly}
                onChange={(e) => setViewSavedOnly(e.target.checked)}
                className="rounded border-white/10 bg-brand-deep text-brand-purple focus:ring-brand-purple cursor-pointer h-3.5 w-3.5"
              />
              <label htmlFor="saved-only-switch" className="text-[10px] text-gray-300 font-medium select-none cursor-pointer flex items-center">
                <Bookmark className="w-3 h-3 text-brand-purple mr-1" fill={viewSavedOnly ? "currentColor" : "none"} />
                Saved ({savedJobIds.length})
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Side-by-Side Explorer (Left list, Right detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SCROLLABLE JOBS FEED (col-span-5) */}
        <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" id="search-jobs-list-feed">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-gray-400 font-mono">
              MATCHED POSITIONS: <span className="text-white font-bold">{filteredJobs.length}</span>
            </span>
            {viewSavedOnly && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-purple/15 text-brand-purple border border-brand-purple/25 font-mono">
                BOOKMARKED ONLY
              </span>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border border-white/5 space-y-3">
              <p className="text-gray-400 font-mono text-xs">NO RESULTS FOUND</p>
              <p className="text-[11px] text-gray-300 max-w-xs mx-auto leading-relaxed">
                We couldn't find matches for this specific combination. Try relaxing your search terms or unchecking compliance criteria.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCountry("");
                  setCategory("");
                  setVisaSponsorship(false);
                  setViewSavedOnly(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white hover:bg-white/10 transition"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const isActive = activeJob?.id === job.id;
              const hasApplied = appliedJobs.includes(job.id);
              const matchScore = getMatchScore(job);

              return (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left space-y-3 relative overflow-hidden group ${
                    isActive 
                      ? "bg-white/[0.05] border-brand-blue/60 shadow-lg shadow-brand-blue/5" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                  }`}
                  id={`job-feed-item-${job.id}`}
                >
                  {/* Active highlight bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue"></div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-9 h-9 rounded-lg ${job.logoBg} flex items-center justify-center text-white font-mono font-extrabold text-sm shadow`}>
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-sans mt-0.5">{job.company}</p>
                      </div>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved 
                          ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple" 
                          : "bg-white/5 border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-brand-blue shrink-0" />
                      {job.location}
                    </span>
                    <span className="font-mono font-semibold text-gray-200">{job.salary}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-medium">
                        {job.visaStatus}
                      </span>
                      {hasApplied && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Applied
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[9px] font-mono text-gray-400">Match Accuracy:</span>
                      <span className={`text-[10px] font-mono font-bold ${matchScore > 85 ? "text-emerald-400" : "text-brand-blue"}`}>
                        {matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: WORKSPACE BOARD FOR DETAILED STRATEGY & COMPLIANCE HUB (col-span-7) */}
        <div className="lg:col-span-7" id="search-details-column">
          {!activeJob ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-2">
                <Sparkles className="w-6 h-6 text-brand-purple animate-pulse" />
              </div>
              <p className="text-gray-400 font-mono text-xs uppercase">Aetheric Workspace Board</p>
              <h3 className="text-lg font-display font-semibold text-white">Select a career in the feed</h3>
              <p className="text-xs text-gray-300 max-w-sm leading-relaxed font-light">
                Click any job listing card on the left to instantly load its high-impact recruitment blueprints, legal visa difficulty scoring, and net take-home expat modeling.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col min-h-[580px] bg-brand-deep/30">
              
              {/* Header block */}
              <div className="p-5 bg-white/[0.01] border-b border-white/5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-11 h-11 rounded-xl ${activeJob.logoBg} flex items-center justify-center text-white font-mono font-extrabold text-lg shadow-lg`}>
                      {activeJob.company[0]}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base md:text-lg text-white leading-snug">
                        {activeJob.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium flex items-center mt-1">
                        <Building className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                        {activeJob.company} • {activeJob.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => alert(`Shared URL for ${activeJob.title} copied to clipboard!`)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition"
                      title="Share career details"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => toggleSaveJob(activeJob.id, e)}
                      className={`p-2 rounded-xl border transition ${
                        savedJobIds.includes(activeJob.id) 
                          ? "bg-brand-purple/15 border-brand-purple/30 text-brand-purple" 
                          : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                      }`}
                      title={savedJobIds.includes(activeJob.id) ? "Bookmarked" : "Save job"}
                    >
                      <Bookmark className="w-4 h-4" fill={savedJobIds.includes(activeJob.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                {/* Info tags and Quick stats */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300 font-mono pt-1">
                  <span className="px-2.5 py-1 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold">
                    {activeJob.visaStatus}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple">
                    {activeJob.relocationSupport}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-gray-300">
                    {activeJob.type}
                  </span>
                  <span className="ml-auto text-[11px] font-bold text-white flex items-center bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    94% Fit Rate
                  </span>
                </div>
              </div>

              {/* Sub-tab Selection Menu (Google style) */}
              <div className="flex border-b border-white/5 bg-white/[0.01] px-4">
                {[
                  { id: "details", label: "📋 Core Requirements", color: "border-brand-blue text-brand-blue" },
                  { id: "calculator", label: "📊 Expat Net Calculator", color: "border-brand-purple text-brand-purple" },
                  { id: "roadmap", label: "🚀 Visa & AI Guidance", color: "border-brand-indigo text-brand-indigo" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
                      detailTab === tab.id 
                        ? `${tab.color} text-white` 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Detailed Scrollable Section */}
              <div className="p-5 flex-1 max-h-[460px] overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-left">
                
                {/* TAB 1: DETAILS */}
                {detailTab === "details" && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Role Description</h4>
                      <p className="text-xs text-gray-300 font-light leading-relaxed">
                        {activeJob.description}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Pre-requisite Qualifications</h4>
                      <ul className="space-y-2">
                        {activeJob.requirements.map((req, i) => (
                          <li key={i} className="flex items-start text-xs text-gray-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 mr-2.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Target Corporate Benefits</h4>
                      <ul className="space-y-2">
                        {activeJob.benefits.map((ben, i) => (
                          <li key={i} className="flex items-start text-xs text-gray-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 mr-2.5 shrink-0" />
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Technical Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeJob.techStack.map((tech) => (
                          <span key={tech} className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/5 text-gray-200 font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXPAT CALCULATOR */}
                {detailTab === "calculator" && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="flex justify-between items-center text-[11px] text-gray-400 font-mono">
                        <span>MODEL FOR COUNTRY:</span>
                        <span className="text-white font-bold">{activeJob.country.toUpperCase()} ({currency.name})</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-normal mt-1.5 font-light">
                        Model your real savings. Taxes and local cost metrics are updated dynamically for <span className="text-white font-medium">{activeJob.location}</span>.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Salary Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Pre-tax Annual Base</span>
                          <span className="text-white font-mono font-bold text-brand-blue">
                            {currency.symbol}{salaryValue.toLocaleString()} / yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min={salaryBounds.min}
                          max={salaryBounds.max}
                          step={Math.round((salaryBounds.max - salaryBounds.min) / 20) || 1000}
                          value={salaryValue}
                          onChange={(e) => setSalaryValue(Number(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>Min: {currency.symbol}{salaryBounds.min.toLocaleString()}</span>
                          <span>Max: {currency.symbol}{salaryBounds.max.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Rent Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{currency.rentLabel}</span>
                          <span className="text-white font-mono font-bold text-brand-purple">
                            {currency.symbol}{housingValue.toLocaleString()} / mo
                          </span>
                        </div>
                        <input
                          type="range"
                          min={currency.minRent}
                          max={currency.maxRent}
                          step={currency.stepRent}
                          value={housingValue}
                          onChange={(e) => setHousingValue(Number(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>Frugal: {currency.symbol}{currency.minRent.toLocaleString()}</span>
                          <span>Premium: {currency.symbol}{currency.maxRent.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Expat Incentives checkbox */}
                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-300 flex items-center">
                            <Percent className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                            Apply Expat Tax Incentives
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applyExpatRuling}
                              onChange={(e) => setApplyExpatRuling(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-purple"></div>
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          {activeJob.country.toLowerCase() === "netherlands" 
                            ? "Activates the Dutch 30% Ruling, rendering 30% of your gross income completely tax-free for 5 years."
                            : `Estimates local expat skilled professional deductions, bringing down standard regional tax rates by 15%.`}
                        </p>
                      </div>

                      {/* Calculations breakdown */}
                      <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Gross Income</span>
                          <span className="text-white font-mono">{currency.symbol}{monthlyGross.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span className="flex items-center">
                            Income Tax Deductions
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-rose-500/10 rounded text-rose-300 font-mono">
                              {Math.round(effectiveTaxRate * 100)}%
                            </span>
                          </span>
                          <span className="font-mono">-{currency.symbol}{monthlyTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-brand-blue font-semibold border-b border-white/5 pb-2">
                          <span>Take-home Net Salary</span>
                          <span className="font-mono">{currency.symbol}{monthlyNetTakeHome.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-400">Housing Costs (Rent/Gas)</span>
                          <span className="text-white font-mono">-{currency.symbol}{housingValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center">
                            Other Regional Expenses
                            <span className="group relative ml-1 cursor-help">
                              <Info className="w-3 h-3 text-gray-500" />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 rounded bg-brand-deep text-[9px] text-gray-300 font-normal leading-tight hidden group-hover:block border border-white/10 shadow-xl z-20">
                                Groceries, public transit, local medical coverage, and miscellaneous living variables.
                              </span>
                            </span>
                          </span>
                          <span className="text-white font-mono">-{currency.symbol}{estimatedOtherExpenses.toLocaleString()}</span>
                        </div>

                        {/* Final Net Savings Result Card */}
                        <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white flex items-center">
                              <PiggyBank className="w-4 h-4 mr-1.5 text-brand-purple animate-bounce" />
                              Estimated Net Savings
                            </span>
                            <span className={`font-mono font-bold text-sm ${monthlyNetSavings > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {currency.symbol}{monthlyNetSavings.toLocaleString()} / mo
                            </span>
                          </div>

                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${monthlyNetSavings > 0 ? "bg-emerald-400" : "bg-rose-400"}`}
                              style={{ width: `${Math.min(100, Math.max(0, savingsPercentage))}%` }}
                            />
                          </div>

                          <p className="text-[10px] text-gray-400 flex items-center justify-between">
                            <span>Savings Ratio: {Math.max(0, Math.round(savingsPercentage))}% of gross</span>
                            <span className="font-semibold text-brand-purple text-[10px]">
                              {monthlyNetSavings > (monthlyGross * 0.3) 
                                ? "🚀 Exceptional Savings" 
                                : monthlyNetSavings > (monthlyGross * 0.1) 
                                  ? "⚖️ Balanced Budget" 
                                  : "⚠️ High Expense Profile"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: VISA ROADMAP */}
                {detailTab === "roadmap" && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Relocation Ease</span>
                        <span className="text-xs text-white font-bold flex items-center">
                          <Check className="w-4 h-4 text-emerald-400 mr-1 shrink-0" />
                          High Priority Fast-track
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                        <span className="text-[9px] text-gray-400 uppercase font-mono block">Avg. Legal Process</span>
                        <span className="text-xs text-white font-bold flex items-center">
                          <Clock className="w-4 h-4 text-brand-blue mr-1 shrink-0" />
                          3 - 6 Weeks
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Compliance Timeline Steps</h4>
                      
                      <div className="relative border-l border-white/5 pl-4 ml-1.5 space-y-4">
                        {[
                          { title: "Stage 1: Technical Score Alignment Check", desc: "Your ATS Score (pre-checked) bypasses the default filters and delivers your profile straight to the hiring committee.", active: true },
                          { title: "Stage 2: Technical & Behavioral Panel Interviews", desc: "Use our Interactive Interview Studio to practice regional questions, complete behavioral tests and read feedback.", active: false },
                          { title: "Stage 3: Corporate Contract Signing & Sponsorship Ticket", desc: "The company sponsors issue a legally binding Certificate of Sponsorship (CoS) or municipal visa guarantee letter.", active: false },
                          { title: "Stage 4: Visa Application & Border Clearance", desc: "Expedited processing through national consular Fast-tracks (EU Blue Card, highly skilled immigrant, or Japan HSE point visa).", active: false }
                        ].map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Circle Indicator */}
                            <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                              step.active 
                                ? "bg-brand-blue border-brand-blue shadow shadow-brand-blue" 
                                : "bg-brand-deep border-white/10"
                            }`} />
                            
                            <div className="space-y-0.5 text-xs">
                              <h5 className={`font-bold ${step.active ? "text-brand-blue" : "text-white"}`}>{step.title}</h5>
                              <p className="text-gray-400 font-light leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-brand-indigo/10 border border-brand-indigo/20 rounded-xl flex items-start space-x-2">
                      <Trophy className="w-4 h-4 text-brand-indigo mt-0.5 shrink-0" />
                      <p className="text-[10px] text-gray-300 leading-normal">
                        <strong>Immigration Advantage:</strong> This employer matches your relocation support criteria with verified flight subsidies and temp housing support. No upfront visa expenses are needed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Action Panel */}
              <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 block font-mono">IMMEDIATE STATUS</span>
                  <span className="text-xs text-white font-mono font-semibold">{activeJob.salary} / yr</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={(e) => {
                      const hasApplied = appliedJobs.includes(activeJob.id);
                      if (hasApplied) return;
                      handleApplyClick(activeJob, e);
                    }}
                    disabled={appliedJobs.includes(activeJob.id)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg transition-all ${
                      appliedJobs.includes(activeJob.id)
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                        : "bg-gradient-to-r from-brand-blue to-brand-indigo text-white hover:shadow-brand-blue/20 hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>{appliedJobs.includes(activeJob.id) ? "Fast-Track Applied" : "Submit Fast-Track Profile"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPLIANCE APPLICATION DRAWER / MODAL */}
      {isApplyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deep/80 backdrop-blur-md" id="application-modal">
          <div className="glass-panel rounded-2xl p-6 md:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative space-y-6 animate-fadeIn">
            <button
              onClick={() => setIsApplyingJob(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              id="close-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-mono text-brand-blue uppercase font-bold">
                Direct Corporate Visa Channel
              </div>
              <h3 className="font-display font-bold text-lg text-white">Direct International Application</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                You are submitting your profile directly to the corporate immigration fast-track department of <strong className="text-white">{isApplyingJob.company}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3 text-xs text-left" id="modal-job-summary">
              <div className={`w-9 h-9 rounded-lg ${isApplyingJob.logoBg} flex items-center justify-center text-white font-mono font-extrabold`}>
                {isApplyingJob.company[0]}
              </div>
              <div>
                <p className="font-bold text-white text-xs">{isApplyingJob.title}</p>
                <p className="text-gray-400 mt-0.5 text-[11px]">{isApplyingJob.location} • {isApplyingJob.salary}</p>
              </div>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">Cover Letter Notes or Introduction (Optional)</label>
                <textarea
                  placeholder="Introduce yourself, your visa requirement timeline, and why you are excited to relocate..."
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  className="w-full glass-input text-xs text-white p-3 rounded-xl min-h-[100px] leading-relaxed"
                  id="application-cover-notes"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-gray-300 leading-relaxed" id="visa-warning-box">
                <span className="font-semibold text-emerald-400 uppercase block font-mono mb-1">Pre-Check Success</span>
                Your cached ATS score complies with this job's basic technical prerequisites. This guarantees your profile bypasses standard entry bots and routes directly to the recruiting lead.
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyingJob(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-xs text-white hover:bg-white/10 border border-white/5 font-medium transition"
                  id="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo text-xs text-white font-semibold shadow-lg shadow-brand-blue/20 transition-all hover:opacity-90"
                  id="modal-submit-btn"
                >
                  Submit Fast-Track Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
