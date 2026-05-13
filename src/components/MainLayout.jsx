import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, Zap, Calendar, BookOpen, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function MainLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Briefcase },
    { path: '/programs', label: 'Programs', icon: Briefcase },
    { path: '/projects', label: 'Projects', icon: Zap },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/learning', label: 'Learning', icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex-1">
            {sidebarOpen ? (
              <>
                <h1 className="text-2xl font-heading font-bold text-primary">OrgHub</h1>
                <p className="text-xs text-muted-foreground mt-1">Manage everything in one place</p>
              </>
            ) : (
              <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                O
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 flex-shrink-0 -mr-2"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} title={sidebarOpen ? '' : item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-muted'
                  } ${sidebarOpen ? '' : 'justify-center'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-2">
          {sidebarOpen && (
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium mt-1">{user?.full_name || 'User'}</p>
            </div>
          )}
          <Button
            onClick={logout}
            variant="outline"
            className={sidebarOpen ? 'w-full gap-2 justify-start' : 'w-full'}
            size="sm"
            title={sidebarOpen ? '' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-card px-8 flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">OrgHub</h2>
          <div className="text-sm text-muted-foreground">
            {user?.role === 'admin' && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}