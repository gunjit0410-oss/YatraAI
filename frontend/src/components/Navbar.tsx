import React, { useState } from 'react';
import { Compass, Sparkles, Bookmark, Bot, Menu, X, Globe, User as UserIcon, LogOut, LogIn } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleChatbot: () => void;
  user: { isAuthenticated: boolean; username: string | null };
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  toggleChatbot,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'explore', label: 'Destinations', icon: Globe },
    { id: 'planner', label: 'AI Planner', icon: Sparkles },
    { id: 'saved', label: 'Saved Trips', icon: Bookmark },
  ];

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-sm bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Yatra<span className="text-amber-600">AI</span>
              <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-full tracking-wider">
                AI Pro
              </span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wide">
              Incredible India Travel OS
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-full border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleChatbot}
            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 text-sky-600 animate-pulse" />
            AI Assistant
          </button>

          {/* User Auth Control */}
          {user.isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-full text-sm font-black shadow-xs hover:bg-amber-100 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-amber-600" />
                <span>👋 {user.username}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-left">
                  <button
                    onClick={() => {
                      setActiveTab('saved');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-amber-600" /> My Saved Trips
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </button>
          )}

          <button
            onClick={() => setActiveTab('planner')}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            Plan Trip
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg bg-slate-100 border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left ${
                  isActive ? 'bg-amber-500 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          {user.isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200"
            >
              <LogOut className="w-5 h-5" />
              Logout ({user.username})
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200"
            >
              <LogIn className="w-5 h-5 text-amber-600" />
              Login / Register
            </button>
          )}

          <button
            onClick={() => {
              toggleChatbot();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-sky-700 bg-sky-50 border border-sky-200"
          >
            <Bot className="w-5 h-5 text-sky-600" />
            AI Travel Assistant
          </button>
        </div>
      )}
    </nav>
  );
};
