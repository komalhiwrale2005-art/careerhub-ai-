import React, { useState } from "react";
import { Search, Globe, ChevronRight, CheckCircle, ArrowUpRight, Sparkles, MapPin, Building, ShieldCheck } from "lucide-react";
import { Job } from "../types";

interface LandingPageProps {
  onSearch: (filters: { query: string; country: string; category: string; visaSponsorship: boolean }) => void;
  mockJobs: Job[];
  onSelectJob: (job: Job) => void;
  setActiveTab: (tab: string) => void;
}

export default function LandingPage({ onSearch, mockJobs, onSelectJob, setActiveTab }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visaSponsorshipOnly, setVisaSponsorshipOnly] = useState(false);

  const countries = ["Japan", "Netherlands", "United Kingdom", "Germany", "Singapore", "Canada"];
  const categories = ["Software Engineering", "AI & Data Science", "Product Management", "Creative & Design"];

  const hotspots = [
    {
      country: "Japan",
      city: "Tokyo",
      sponsorshipRate: "92%",
      keySector: "AI, Genomics & Robotics",
      visaTime: "4-6 weeks",
      bgClass: "from-red-500/20 to-rose-900/20 border-red-500/30",
      badgeColor: "text-red-400 bg-red-400/10 border-red-400/20"
    },
    {
      country: "Netherlands",
      city: "Amsterdam",
      sponsorshipRate: "95%",
      keySector: "FinTech & Cloud Gateway",
      visaTime: "2-4 weeks (30% Tax Ruling)",
      bgClass: "from-orange-500/20 to-amber-900/20 border-orange-500/30",
      badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/20"
    },
    {
      country: "United Kingdom",
      city: "London",
      sponsorshipRate: "88%",
      keySector: "B2B SaaS & Analytics",
      visaTime: "3-5 weeks",
      bgClass: "from-blue-500/20 to-cyan-900/20 border-blue-500/30",
      badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20"
    },
    {
      country: "Singapore",
      city: "Downtown",
      sponsorshipRate: "80%",
      keySector: "Web3 & Asset Management",
      visaTime: "6-8 weeks",
      bgClass: "from-emerald-500/20 to-teal-900/20 border-emerald-500/30",
      badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    },
    {
      country: "Canada",
      city: "Vancouver",
      sponsorshipRate: "90%",
      keySector: "SaaS & AI Orchestration",
      visaTime: "4-8 weeks (Express Entry)",
      bgClass: "from-purple-500/20 to-violet-900/20 border-purple-500/30",
      badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20"
    }
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      country: selectedCountry,
      category: selectedCategory,
      visaSponsorship: visaSponsorshipOnly
    });
    setActiveTab("search");
  };

  const handleHotspotClick = (country: string) => {
    onSearch({
      query: "",
      country: country,
      category: "",
      visaSponsorship: true
    });
    setActiveTab("search");
  };

  const handleCategoryClick = (category: string) => {
    onSearch({
      query: "",
      country: "",
      category: category,
      visaSponsorship: false
    });
    setActiveTab("search");
  };

  // Pre-seed 3 highlight jobs
  const featuredJobs = mockJobs.slice(0, 3);

  return (
    <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-16 pb-24" id="landing-container">
      
      {/* 1. Hero Search Section */}
      <div className="text-center max-w-4xl mx-auto pt-6 md:pt-12 space-y-6" id="hero-header-section">
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs font-mono text-brand-purple tracking-wide" id="hero-mini-badge">
          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AETHERIC RECRUITMENT ENGINE ONLINE</span>
        </div>

        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[1.1] text-white" id="hero-main-title">
          The Premium Gateway for <br />
          <span className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-purple bg-clip-text text-transparent glow-text-purple">
            Global Tech Careers
          </span>
        </h1>
        
        <p className="text-base text-gray-300 max-w-2xl mx-auto font-sans font-light leading-relaxed" id="hero-subtitle">
          Connect directly with elite technology and digital companies offering verified 
          <span className="text-brand-blue font-medium"> Visa Sponsorship</span>, relocation support, and tax benefits. Driven by real-time AI compliance matching.
        </p>

        {/* Hero Interactive Search Form */}
        <form 
          onSubmit={handleHeroSubmit}
          className="glass-panel rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10 max-w-3xl mx-auto text-left space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4 mt-8"
          id="hero-search-form"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Job title, technical skill, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-sm text-white pl-10 pr-4 py-3 rounded-xl"
              id="hero-search-query"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="glass-input text-xs text-gray-300 px-3 py-3 rounded-xl min-w-[130px] cursor-pointer"
              id="hero-search-country"
            >
              <option value="">Any Country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input text-xs text-gray-300 px-3 py-3 rounded-xl min-w-[150px] cursor-pointer"
              id="hero-search-category"
            >
              <option value="">Any Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between md:justify-start gap-4">
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visaSponsorshipOnly}
                onChange={(e) => setVisaSponsorshipOnly(e.target.checked)}
                className="rounded border-white/20 bg-brand-deep text-brand-purple focus:ring-brand-purple"
                id="hero-visa-checkbox"
              />
              <span>Visa Sponsorship</span>
            </label>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/80 hover:to-brand-purple/80 text-white font-medium text-xs shadow-lg shadow-brand-indigo/20 transition-all duration-300 flex items-center justify-center space-x-1 hover:scale-105"
              id="hero-submit-btn"
            >
              <span>Find Jobs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Global Hotspots & Relocation Metrics */}
      <div className="space-y-6" id="global-hotspots-section">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="font-display font-semibold text-xl md:text-2xl text-white">Global Talent Hotspots</h2>
            <p className="text-xs text-gray-400">Verified international visa success paths and relocation indices</p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-brand-blue font-mono">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>REAL-TIME HOTSPOTS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="hotspots-grid">
          {hotspots.map((hot, idx) => (
            <button
              key={idx}
              onClick={() => handleHotspotClick(hot.country)}
              className={`glass-panel rounded-2xl p-5 text-left bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:border-white/20 group focus:outline-none ${hot.bgClass}`}
              id={`hotspot-btn-${hot.country.toLowerCase()}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${hot.badgeColor}`}>
                    {hot.country}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-2 flex items-center">
                    {hot.city}
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-mono tracking-widest">Sponsorship</p>
                  <p className="text-xl font-display font-bold text-white leading-none">{hot.sponsorshipRate}</p>
                </div>
              </div>

              <div className="border-t border-white/5 my-4"></div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400">Primary Hub</p>
                  <p className="font-medium text-gray-200">{hot.keySector}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Visa processing</p>
                  <p className="font-mono font-medium text-brand-blue">{hot.visaTime}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Featured Verified Global Roles */}
      <div className="space-y-6" id="featured-jobs-section">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="font-display font-semibold text-xl md:text-2xl text-white">Verified Sponsorship Roles</h2>
            <p className="text-xs text-gray-400">Featured high-growth opportunities with guaranteed visa processing</p>
          </div>
          <button
            onClick={() => setActiveTab("search")}
            className="text-xs text-brand-blue hover:text-brand-purple flex items-center space-x-1 font-medium transition-colors"
            id="see-all-jobs-btn"
          >
            <span>See All Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="featured-jobs-grid">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="glass-card rounded-2xl p-6 border border-white/5 hover:border-brand-blue/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              id={`featured-job-card-${job.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl ${job.logoBg} flex items-center justify-center text-white font-mono font-bold text-sm shadow-inner`}>
                      {job.company[0]}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-brand-blue transition-colors line-clamp-1">{job.title}</h4>
                      <p className="text-xs text-gray-400 flex items-center mt-0.5">
                        <Building className="w-3 h-3 mr-1" />
                        <span>{job.company}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono font-medium">
                    {job.visaDifficulty} Risk
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[9px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-300 font-mono">
                    {job.location}
                  </span>
                  <span className="text-[9px] px-2 py-1 rounded bg-emerald-400/5 border border-emerald-400/10 text-emerald-400 font-mono font-medium">
                    {job.visaStatus}
                  </span>
                  <span className="text-[9px] px-2 py-1 rounded bg-brand-purple/5 border border-brand-purple/10 text-brand-purple font-mono">
                    {job.relocationSupport}
                  </span>
                </div>

                <p className="text-xs text-gray-300 font-light line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="border-t border-white/5 my-4 pt-4 flex items-center justify-between text-xs">
                <p className="text-gray-400">
                  Salary: <span className="text-white font-mono font-medium">{job.salary}</span>
                </p>
                <div className="flex items-center space-x-1 text-brand-blue font-medium group-hover:translate-x-1 transition-transform">
                  <span>Strategy Guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Aetheric Global Compliance Standards */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden" id="compliance-feature-panel">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AETHERIC INTEGRITY CERTIFIED</span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">Compliance & Global Protection</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Every employer listed on the Global Career Hub AI has passed strict multi-factor compliance checking, verifying financial stability to support international sponsorships and relocation.
            </p>
            <div className="space-y-2">
              {[
                "100% legal visa contract guarantees",
                "Fully verified relocation assistance programs",
                "Direct communication with immigration counsel"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-white/5 space-y-2">
              <p className="text-2xl font-display font-bold text-brand-blue">2,400+</p>
              <h4 className="font-semibold text-xs text-white">International Hires</h4>
              <p className="text-[11px] text-gray-400">Candidates securely relocated across 18 partner countries since launch.</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5 space-y-2">
              <p className="text-2xl font-display font-bold text-brand-purple">98.4%</p>
              <h4 className="font-semibold text-xs text-white">Visa Approval Rate</h4>
              <p className="text-[11px] text-gray-400">High-efficiency processing via pre-vetted corporate fasttracks.</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5 space-y-2">
              <p className="text-2xl font-display font-bold text-brand-indigo">S$4.2M</p>
              <h4 className="font-semibold text-xs text-white">Relocation Covered</h4>
              <p className="text-[11px] text-gray-400">Flights, temporary lodging, and lifestyle budgets funded directly by companies.</p>
            </div>
            <div className="glass-panel rounded-xl p-5 border border-white/5 space-y-2">
              <p className="text-2xl font-display font-bold text-emerald-400">30%</p>
              <h4 className="font-semibold text-xs text-white">Average Tax Ruling</h4>
              <p className="text-[11px] text-gray-400">Exclusive tax reductions available for skilled expat hires in NL, DK & SE.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
