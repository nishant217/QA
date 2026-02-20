import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug, 
  X, 
  Plus, 
  Trash2, 
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useBugStore } from '@/stores/bugStore';
import { useAuthStore } from '@/stores/authStore';

interface BugControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugControlPanel({ isOpen, onClose }: BugControlPanelProps) {
  const { currentUser } = useAuthStore();
  const { bugs, activeBugs, removeAllBugs, toggleBug } = useBugStore();
  const [showInactive, setShowInactive] = useState(false);

  // Only show to admin users
  if (!currentUser || currentUser.role !== 'SYSTEM_ADMIN') {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Bug className="w-4 h-4" />;
  };

  const displayedBugs = showInactive ? bugs : bugs.filter(bug => bug.isActive);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">QA Bug Injection</h3>
                  <p className="text-xs text-[var(--text-muted)]">Admin Testing Panel</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Active Bugs: {activeBugs.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded"
                  >
                    {showInactive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {showInactive ? 'All' : 'Active'}
                  </button>
                  <button
                    onClick={removeAllBugs}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
              </div>
              
              {activeBugs.length > 0 && (
                <div className="text-xs text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded p-2">
                  ⚠️ Active bugs may affect application behavior for testing purposes
                </div>
              )}
            </div>

            {/* Bug List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                {displayedBugs.map((bug) => (
                  <div
                    key={bug.id}
                    className={`
                      p-3 rounded-lg border transition-all duration-200
                      ${bug.isActive 
                        ? getSeverityColor(bug.severity) + ' ring-1 ring-current'
                        : 'bg-[var(--bg-surface)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex-shrink-0 p-1.5 rounded
                        ${bug.isActive 
                          ? 'bg-current/20' 
                          : 'bg-[var(--text-muted)]/10'
                        }
                      `}>
                        {getSeverityIcon(bug.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`
                            text-sm font-medium leading-tight
                            ${bug.isActive 
                              ? 'text-current' 
                              : 'text-[var(--text-primary)]'
                            }
                          `}>
                            {bug.name}
                          </h4>
                          <button
                            onClick={() => toggleBug(bug.id)}
                            className={`
                              p-1 rounded transition-colors
                              ${bug.isActive
                                ? 'hover:bg-current/10 text-current'
                                : 'hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
                              }
                            `}
                          >
                            {bug.isActive ? <Trash2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          </button>
                        </div>
                        
                        <p className={`
                          text-xs mt-1 line-clamp-2
                          ${bug.isActive 
                            ? 'text-current/80' 
                            : 'text-[var(--text-muted)]'
                          }
                        `}>
                          {bug.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium border
                            ${getSeverityColor(bug.severity)}
                          `}>
                            {bug.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-[var(--text-subtle)]">
                            {bug.type}
                          </span>
                        </div>
                        
                        {bug.isActive && bug.injectedAt && (
                          <div className="text-xs text-current/60 mt-1">
                            Injected: {new Date(bug.injectedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {displayedBugs.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {showInactive ? 'No bugs available' : 'No active bugs'}
                    </p>
                    {!showInactive && (
                      <p className="text-xs mt-1">
                        Click the eye icon to see all bugs
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BugControlPanel;