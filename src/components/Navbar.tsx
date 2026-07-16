import { useState, useEffect } from "react";
import { Briefcase, LayoutDashboard, Search, Sparkles, MapPin, Globe, MessageSquare } from "lucide-react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userScore: number;
}

export default function Navbar({ activeTab, setActiveTab, userScore }: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: "landing", label: "Home", icon: Globe },
    { id: "search", label: "Global Search", icon: Search },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ai-center", label: "AI Career Strategy", icon: Sparkles },
    { id: "ai-assistant", label: "AI Chat & Voice", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full px-4 md:px-8 bg-white/5 border-b border-white/10 backdrop-blur-md h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab("landing")}
          className="flex items-center space-x-2 text-left focus:outline-none group"
          id="nav-logo-btn"
        >
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-blue via-brand-indigo to-brand-purple p-[1.5px] shadow-lg shadow-brand-indigo/20">
            <div className="w-full h-full bg-brand-deep rounded-[7px] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-brand-blue group-hover:text-brand-purple transition-colors duration-300" />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-lg blur-sm opacity-30 group-hover:opacity-60 transition duration-300 pointer-events-none"></div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Global Career Hub <span className="text-brand-purple font-extrabold font-mono text-xs ml-0.5 glow-text-purple">AI</span>
            </h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Aetheric Professional</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5" id="nav-tabs-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === "search" && activeTab === "job-strategy");
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-blue/30 to-brand-purple/30 text-white border border-brand-blue/20 shadow-lg shadow-brand-blue/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                id={`nav-tab-${item.id}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-blue" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Info Section */}
        <div className="flex items-center space-x-3" id="nav-right-section">
          {/* Global Status Chip */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-mono text-brand-blue font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-blue"></span>
            </span>
            <span>VISA MATCH ONLINE</span>
          </div>

          {/* User Score Card */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 hover:from-brand-indigo/20 hover:to-brand-purple/20 border border-brand-purple/20 transition-all duration-300 text-left focus:outline-none"
            id="nav-profile-btn"
          >
            <div className="relative">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  className="w-7 h-7 rounded-full border border-brand-purple/30 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-xs font-bold text-brand-purple font-mono">
                  {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : "G"}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-brand-deep"></div>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] text-gray-300 font-medium leading-none truncate max-w-[90px]">
                {currentUser?.displayName || "Guest Expat"}
              </p>
              <p className="text-[10px] font-mono font-bold text-brand-purple leading-none mt-0.5">
                Resume ATS: <span className="text-white">{userScore}</span>
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-deep/80 backdrop-blur-xl border-t border-white/5 py-2 px-4 justify-around" id="nav-tabs-mobile">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "search" && activeTab === "job-strategy");
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
                isActive ? "text-brand-blue" : "text-gray-400 hover:text-white"
              }`}
              id={`nav-tab-mobile-${item.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
