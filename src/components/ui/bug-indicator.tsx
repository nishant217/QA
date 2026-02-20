import React from 'react';
import { Bug, AlertTriangle, X } from 'lucide-react';
import { useBugStore } from '@/stores/bugStore';
import { useAuthStore } from '@/stores/authStore';

interface BugIndicatorProps {
  className?: string;
  module?: string;
}

// Highlight border for demo users
export function BugHighlight() {
  const { currentUser } = useAuthStore();
  const { getActiveBugs } = useBugStore();

  // Show to demo users (non-admins) with highlight borders
  if (currentUser?.role === 'SYSTEM_ADMIN') {
    return null;
  }

  const activeBugs = getActiveBugs();

  if (activeBugs.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-2 border-4 border-red-500 border-dashed rounded-lg animate-pulse" />
      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium">
        QA Mode: {activeBugs.length} Bug{activeBugs.length !== 1 ? 's' : ''} Active
      </div>
    </div>
  );
}

export function BugIndicator({ className = '', module }: BugIndicatorProps) {
  const { currentUser } = useAuthStore();
  const { getActiveBugs, removeBug } = useBugStore();

  // Only show detailed bug info to admin users
  if (!currentUser || currentUser.role !== 'SYSTEM_ADMIN') {
    return null;
  }

  const activeBugs = getActiveBugs();
  
  // Filter by module if specified
  const filteredBugs = module 
    ? activeBugs.filter(bug => bug.description.toLowerCase().includes(module.toLowerCase()))
    : activeBugs;

  if (filteredBugs.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-20 right-4 z-50 space-y-2 ${className}`}>
      {filteredBugs.map((bug) => (
        <div
          key={bug.id}
          className={`
            relative p-3 rounded-lg border-l-4 bg-[var(--bg-card)] shadow-lg max-w-sm
            ${bug.severity === 'critical' ? 'border-red-500 bg-red-500/5' : ''}
            ${bug.severity === 'high' ? 'border-orange-500 bg-orange-500/5' : ''}
            ${bug.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/5' : ''}
            ${bug.severity === 'low' ? 'border-blue-500 bg-blue-500/5' : ''}
          `}
        >
          <button
            onClick={() => removeBug(bug.id)}
            className="absolute top-1 right-1 p-1 hover:bg-[var(--bg-hover)] rounded"
          >
            <X className="w-3 h-3 text-[var(--text-muted)]" />
          </button>
          
          <div className="flex items-start gap-2 pr-6">
            <div className={`
              flex-shrink-0 p-1 rounded
              ${bug.severity === 'critical' ? 'bg-red-500/20' : ''}
              ${bug.severity === 'high' ? 'bg-orange-500/20' : ''}
              ${bug.severity === 'medium' ? 'bg-yellow-500/20' : ''}
              ${bug.severity === 'low' ? 'bg-blue-500/20' : ''}
            `}>
              {bug.severity === 'critical' ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Bug className="w-4 h-4 text-orange-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`
                text-sm font-medium
                ${bug.severity === 'critical' ? 'text-red-500' : ''}
                ${bug.severity === 'high' ? 'text-orange-500' : ''}
                ${bug.severity === 'medium' ? 'text-yellow-600' : ''}
                ${bug.severity === 'low' ? 'text-blue-500' : ''}
              `}>
                {bug.name}
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                {bug.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium
                  ${bug.severity === 'critical' ? 'bg-red-500/20 text-red-500' : ''}
                  ${bug.severity === 'high' ? 'bg-orange-500/20 text-orange-500' : ''}
                  ${bug.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-600' : ''}
                  ${bug.severity === 'low' ? 'bg-blue-500/20 text-blue-500' : ''}
                `}>
                  {bug.severity.toUpperCase()}
                </span>
                <span className="text-xs text-[var(--text-subtle)]">
                  Bug ID: {bug.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BugIndicator;