import { useState, useEffect } from "react";
import { Sparkles, Globe, Plane, ShieldCheck, ChevronRight, CheckCircle, ListTodo, GraduationCap, RefreshCw, Layers, Coins, Home, PiggyBank, Percent, Info, Calculator } from "lucide-react";
import { Job } from "../types";

interface JobStrategyProps {
  selectedJob: Job | null;
  mockJobs: Job[];
  onSetSelectedJob: (job: Job) => void;
  setActiveTab: (tab: string) => void;
  onApplyJob: (job: Job) => void;
}

interface StrategicInsights {
  compatibility: number;
  strategy: string;
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
      return { symbol: "¥", name: "JPY", taxRate: 0.22, avgRent: 150000, minRent: 60000, maxRent: 400000, stepRent: 5000, rentLabel: "Monthly Housing & Utilities" };
    case "netherlands":
      return { symbol: "€", name: "EUR", taxRate: 0.36, avgRent: 1800, minRent: 900, maxRent: 3500, stepRent: 50, rentLabel: "Monthly Rent + Utilities" };
    case "germany":
      return { symbol: "€", name: "EUR", taxRate: 0.38, avgRent: 1500, minRent: 700, maxRent: 3000, stepRent: 50, rentLabel: "Monthly Rent (Warm)" };
    case "united kingdom":
      return { symbol: "£", name: "GBP", taxRate: 0.34, avgRent: 2200, minRent: 1000, maxRent: 4500, stepRent: 50, rentLabel: "Monthly Rent + Council Tax" };
    case "singapore":
      return { symbol: "S$", name: "SGD", taxRate: 0.12, avgRent: 3800, minRent: 1800, maxRent: 7500, stepRent: 100, rentLabel: "Monthly Condo/Room Rent" };
    case "switzerland":
      return { symbol: "CHF", name: "CHF", taxRate: 0.16, avgRent: 2300, minRent: 1100, maxRent: 5500, stepRent: 50, rentLabel: "Monthly Rent & Charges" };
    default:
      return { symbol: "$", name: "USD", taxRate: 0.25, avgRent: 2000, minRent: 900, maxRent: 4500, stepRent: 50, rentLabel: "Monthly Living Expenses" };
  }
};

export default function JobStrategy({ selectedJob, mockJobs, onSetSelectedJob, setActiveTab, onApplyJob }: JobStrategyProps) {
  const [insights, setInsights] = useState<StrategicInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentJob = selectedJob || mockJobs[0];

  // Expat Calculator States
  const [salaryValue, setSalaryValue] = useState<number>(100000);
  const [housingValue, setHousingValue] = useState<number>(2000);
  const [applyExpatRuling, setApplyExpatRuling] = useState<boolean>(true);
  const [salaryBounds, setSalaryBounds] = useState({ min: 80000, max: 120000, average: 100000 });

  useEffect(() => {
    if (!currentJob) return;
    const bounds = parseSalaryBoundaries(currentJob.salary);
    setSalaryBounds(bounds);
    setSalaryValue(bounds.average);
    
    const details = getCurrencyDetails(currentJob.country);
    setHousingValue(details.avgRent);
    setApplyExpatRuling(currentJob.country.toLowerCase() === "netherlands");
  }, [currentJob]);

  useEffect(() => {
    if (!currentJob) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/job-strategy/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobTitle: currentJob.title,
            company: currentJob.company,
            country: currentJob.country,
            techStack: currentJob.techStack,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to retrieve intelligence from server");
        }

        const data = await res.json();
        setInsights(data);
      } catch (err: any) {
        console.error("Error loading job strategy insights:", err);
        setError("Unable to connect with AI strategist. Showing local fallback guidelines.");
        // Fallback matching
        setInsights({
          compatibility: 82,
          strategy: `Focus your resume bullet points on high-performance design, especially around ${currentJob.techStack.slice(0, 2).join(" and ")}. In interviews, emphasize your experience working across timezones and adapting to international standards.`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [currentJob]);

  // Calculations
  const currency = getCurrencyDetails(currentJob.country);
  const annualSalary = salaryValue;
  const monthlyGross = Math.round(annualSalary / 12);
  
  // Apply tax discounts or rules
  let effectiveTaxRate = currency.taxRate;
  if (applyExpatRuling) {
    if (currentJob.country.toLowerCase() === "netherlands") {
      effectiveTaxRate = currency.taxRate * 0.7;
    } else {
      effectiveTaxRate = currency.taxRate * 0.85;
    }
  }
  
  const monthlyTax = Math.round(monthlyGross * effectiveTaxRate);
  const monthlyNetTakeHome = monthlyGross - monthlyTax;
  
  const estimatedOtherExpenses = Math.round(monthlyGross * 0.10) + (currentJob.country.toLowerCase() === "japan" ? 40000 : 350);
  const monthlyNetSavings = monthlyNetTakeHome - housingValue - estimatedOtherExpenses;
  
  const savingsPercentage = monthlyGross > 0 ? (monthlyNetSavings / monthlyGross) * 100 : 0;

  const handleApplyClick = () => {
    if (!currentJob) return;
    onApplyJob(currentJob);
    setActiveTab("dashboard");
  };

  return (
    <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8 pb-24" id="strategy-container">
      
      {/* Header Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6" id="strategy-header">
        <div>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-brand-purple animate-pulse" />
            Tactical Placement Guide
          </h2>
          <p className="text-xs text-gray-400 mt-1">AI-powered strategy checklists, tech assessments, and immigration difficulty mappings</p>
        </div>

        {/* Dynamic Job Selection Dropdown */}
        <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 font-mono">Analyzing Role:</span>
          <select
            value={currentJob.id}
            onChange={(e) => {
              const selected = mockJobs.find(job => job.id === e.target.value);
              if (selected) onSetSelectedJob(selected);
            }}
            className="bg-transparent text-xs text-white border-none focus:ring-0 font-semibold cursor-pointer max-w-[200px] md:max-w-[300px]"
            id="strategy-job-picker"
          >
            {mockJobs.map(job => (
              <option key={job.id} value={job.id} className="bg-brand-deep text-white">
                {job.title} ({job.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="strategy-body-grid">
        
        {/* LEFT COLUMN: CRITICAL COMPLIANCE & JOB META */}
        <div className="lg:col-span-4 space-y-6" id="strategy-left-column">
          
          {/* Main Job Overview Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5" id="strategy-job-card">
            <div className="flex items-center space-x-3">
              <div className={`w-11 h-11 rounded-xl ${currentJob.logoBg} flex items-center justify-center text-white font-mono font-bold text-sm`}>
                {currentJob.company[0]}
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">{currentJob.title}</h3>
                <p className="text-xs text-brand-blue">{currentJob.company}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Hotspot</span>
                <span className="text-white font-medium">{currentJob.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Immigration Sponsor</span>
                <span className="text-emerald-400 font-mono font-bold">{currentJob.visaStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Relocation Support</span>
                <span className="text-brand-purple font-mono font-medium">{currentJob.relocationSupport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Immigration Speed Risk</span>
                <span className={`font-mono font-semibold ${
                  currentJob.visaDifficulty === "Low" ? "text-emerald-400" : currentJob.visaDifficulty === "Medium" ? "text-amber-400" : "text-rose-400"
                }`}>
                  {currentJob.visaDifficulty} Difficulty
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Salarial Tier</span>
                <span className="text-white font-mono">{currentJob.salary}</span>
              </div>
            </div>

            <button
              onClick={handleApplyClick}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-xs text-white font-semibold shadow-lg shadow-brand-indigo/15"
              id="strategy-apply-now-btn"
            >
              Apply via Compliance Fast-Track
            </button>
          </div>

          {/* Visa Requirements Hurdles */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4" id="immigration-hurdles-card">
            <h4 className="font-display font-bold text-sm text-white flex items-center">
              <Globe className="w-4 h-4 mr-2 text-brand-blue" />
              Immigration Verification Checklist
            </h4>
            
            <div className="space-y-3" id="visa-checks-list">
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-5 h-5 rounded bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-mono shrink-0">1</div>
                <div>
                  <p className="font-bold text-white">Degree Equivalency</p>
                  <p className="text-gray-400 leading-relaxed font-light mt-0.5">Your University degree must correspond to regional accreditation standards (e.g. Nuffic for Netherlands, Anabin H+ for Germany).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="w-5 h-5 rounded bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-mono shrink-0">2</div>
                <div>
                  <p className="font-bold text-white">Minimum Salary Threshold</p>
                  <p className="text-gray-400 leading-relaxed font-light mt-0.5">Expat fast-tracks require a legal minimum annual contract. This role&apos;s budget fully exceeds local Blue Card thresholds.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="w-5 h-5 rounded bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-mono shrink-0">3</div>
                <div>
                  <p className="font-bold text-white">No Labor Market Test Required</p>
                  <p className="text-gray-400 leading-relaxed font-light mt-0.5">Highly specialized technical roles bypass mandatory local European union sourcing tests, saving 3 months in processing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expat Salary & Net Savings Calculator */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5" id="expat-salary-calculator-card">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-brand-purple" />
                Net Salary & Expat Modeler
              </h4>
              <span className="text-[9px] px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-mono uppercase font-bold">
                {currency.name} Mode
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-light">
              Model your real take-home savings. This calculator parses target taxes and estimated cost of living for <span className="text-white font-medium">{currentJob.location}</span>.
            </p>

            <div className="space-y-4 pt-1">
              {/* Pre-tax Salary Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Model Annual Salary</span>
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

              {/* Housing Slider */}
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

              {/* Expat Tax discounts & Perks */}
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
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
                  {currentJob.country.toLowerCase() === "netherlands" 
                    ? "Activates the highly coveted Dutch 30% Ruling, rendering 30% of your gross income completely tax-free."
                    : `Estimates skilled professional deductions, bringing down the standard regional bracket by 15%.`}
                </p>
              </div>

              {/* Dynamic Compensation Breakdown */}
              <div className="border-t border-white/5 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Gross (Base)</span>
                  <span className="text-white font-mono">{currency.symbol}{monthlyGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span className="flex items-center">
                    Est. Income Taxes
                    <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-rose-500/10 rounded text-rose-300 font-mono">
                      {Math.round(effectiveTaxRate * 100)}%
                    </span>
                  </span>
                  <span className="font-mono">-{currency.symbol}{monthlyTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-blue font-semibold border-b border-white/5 pb-2">
                  <span>Net Take-home Income</span>
                  <span className="font-mono">{currency.symbol}{monthlyNetTakeHome.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Rent & Housing Cost</span>
                  <span className="text-white font-mono">-{currency.symbol}{housingValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center">
                    Misc Expat Costs
                    <span className="group relative ml-1 cursor-help">
                      <Info className="w-3 h-3 text-gray-500" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 rounded bg-brand-deep text-[9px] text-gray-300 font-normal leading-tight hidden group-hover:block border border-white/10 shadow-xl z-20">
                        Estimated target local expenses including groceries, medical insurance, public transit, and utilities.
                      </span>
                    </span>
                  </span>
                  <span className="text-white font-mono">-{currency.symbol}{estimatedOtherExpenses.toLocaleString()}</span>
                </div>

                {/* Final Savings Metric */}
                <div className="p-3.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center">
                      <PiggyBank className="w-4 h-4 mr-1.5 text-brand-purple" />
                      Calculated Monthly Savings
                    </span>
                    <span className={`font-mono font-bold text-sm ${monthlyNetSavings > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {currency.symbol}{monthlyNetSavings.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${monthlyNetSavings > 0 ? "bg-emerald-400" : "bg-rose-400"}`}
                      style={{ width: `${Math.min(100, Math.max(0, savingsPercentage))}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 font-light flex items-center justify-between">
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
        </div>

        {/* RIGHT COLUMN: AI COMPATIBILITY & PREPARATION BLUEPRINT */}
        <div className="lg:col-span-8 space-y-6" id="strategy-right-column">
          
          {/* Compatibility & Dynamic AI Insight Panel */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden" id="ai-insight-panel">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              
              {/* Compatibility Gauge */}
              <div className="shrink-0 text-center space-y-2">
                <p className="text-[10px] text-gray-400 uppercase font-mono tracking-widest">My Match Potential</p>
                
                {loading ? (
                  <div className="w-32 h-32 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin flex items-center justify-center" id="gauge-loading-skeleton">
                    <span className="text-xs text-gray-400">Fetching...</span>
                  </div>
                ) : (
                  <div className="relative w-32 h-32 flex items-center justify-center" id="gauge-display">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={339.3}
                        strokeDashoffset={339.3 - (339.3 * (insights?.compatibility || 80)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white font-mono leading-none">{insights?.compatibility || 82}%</span>
                      <span className="text-[9px] text-brand-blue uppercase font-mono mt-1 font-bold">Matching Index</span>
                    </div>
                  </div>
                )}
                
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-[10px] text-brand-purple font-mono font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PRE-MATCH CLEAN</span>
                </div>
              </div>

              {/* Strategy Advice */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
                  <h3 className="font-display font-semibold text-base text-white">Dynamic AI Placement Strategy</h3>
                </div>

                {loading ? (
                  <div className="space-y-3" id="insights-text-loading-skeleton">
                    <div className="h-3 w-full bg-white/5 rounded animate-pulse"></div>
                    <div className="h-3 w-11/12 bg-white/5 rounded animate-pulse"></div>
                    <div className="h-3 w-4/5 bg-white/5 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-3" id="insights-text-loaded">
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {insights?.strategy}
                    </p>
                    <p className="text-[11px] text-gray-400 italic">
                      Disclaimer: Calculations are simulated against typical visa criteria for {currentJob.location} using neural alignment rules.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Stack Match & Gaps */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5" id="tech-stack-analysis">
            <h4 className="font-display font-semibold text-sm text-white flex items-center">
              <Layers className="w-4 h-4 mr-2 text-brand-indigo" />
              Technical Stack Calibration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Stack requirements */}
              <div className="space-y-3">
                <span className="text-xs text-gray-400 font-mono uppercase block">Prerequisite Tech Stack</span>
                <div className="flex flex-wrap gap-2" id="prerequisite-stack-tags">
                  {currentJob.techStack.map(tech => (
                    <span key={tech} className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white font-mono flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-brand-blue" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action prep plan */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-xs text-brand-purple font-mono uppercase block">Recommended Actions</span>
                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-start space-x-2">
                    <ListTodo className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                    <span>Reference {currentJob.techStack[0]} directly inside your resume summary header.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <GraduationCap className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                    <span>Practice mock coding questions for distributed systems before starting technical sessions.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
