import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth';
import { X, User, Settings, CreditCard, Receipt, Activity, LogOut, Download, Zap, Moon, Sun, Lock, Database } from 'lucide-react';

export type WorkspaceTab = 'profile' | 'settings' | 'subscription' | 'billing' | 'api' | null;

interface SettingsWorkspaceProps {
  activeTab: WorkspaceTab;
  onClose: () => void;
  onNavigate: (tab: WorkspaceTab) => void;
}

export function SettingsWorkspace({ activeTab, onClose, onNavigate }: SettingsWorkspaceProps) {
  const [themePref, setThemePref] = useState<'dark' | 'light'>('dark');
  const [signingOut, setSigningOut] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user;
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('sign out failed', err);
    } finally {
      setSigningOut(false);
    }
  };

  const [firstName, ...restName] = (user?.name ?? '').split(' ');
  const lastName = restName.join(' ');
  const email = user?.email ?? '';

  if (!activeTab) return null;

  const NavItem = ({ id, icon: Icon, label, danger }: { id: WorkspaceTab, icon: any, label: string, danger?: boolean }) => (
    <button 
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
        activeTab === id 
          ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]' 
          : danger
            ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="fixed inset-0 z-[100] bg-[#0a0f18] text-slate-200 flex flex-col md:flex-row overflow-hidden"
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0d131f]">
          <span className="font-bold tracking-tighter text-white">VORLAGE.</span>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 border-r border-white/5 bg-[#0d131f] flex-shrink-0 flex flex-col h-auto md:h-full overflow-y-auto">
          <div className="hidden md:flex items-center justify-between p-6">
            <span className="text-xl font-black tracking-tighter text-white">VORLAGE.</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 md:p-6 space-y-8 flex-1">
            {/* Account Group */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Account</h3>
              <div className="space-y-1">
                <NavItem id="profile" icon={User} label="My Profile" />
                <NavItem id="settings" icon={Settings} label="App Settings" />
              </div>
            </div>

            {/* Billing Group */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Billing & Usage</h3>
              <div className="space-y-1">
                <NavItem id="subscription" icon={CreditCard} label="Subscription" />
                <NavItem id="billing" icon={Receipt} label="Billing History" />
                <NavItem id="api" icon={Activity} label="API Usage" />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-white/5">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0f18] to-[#0d131f] p-4 md:p-12 lg:p-20">
          <div className="max-w-3xl mx-auto">
            
            {/* Profile Page */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                  <p className="text-slate-400">Manage your personal information and preferences.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center border-4 border-[#0a0f18] shadow-2xl overflow-hidden">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-semibold text-indigo-200">
                          {(user?.name ?? user?.email ?? '?')
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          defaultValue={firstName}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          defaultValue={lastName}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        defaultValue={email}
                        readOnly
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* App Settings Page */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">App Settings</h1>
                  <p className="text-slate-400">Configure your workspace environment and API connections.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-400"/> API Configuration</h3>
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">OpenAI API Key</label>
                    <input type="password" defaultValue="sk-xxxxxxxxxxxxxxxxxxxxxxxx" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none focus:border-indigo-500 transition-colors font-mono" />
                    <p className="text-xs text-slate-500 mt-2">Stored locally in your browser. Never sent to our servers.</p>
                  </div>
                  <hr className="border-white/5" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Sun className="w-5 h-5 text-indigo-400"/> Appearance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setThemePref('dark')}
                        className={`flex items-center justify-between p-4 rounded-xl transition-colors ${themePref === 'dark' ? 'border border-indigo-500/50 bg-indigo-500/10 text-indigo-200' : 'border border-white/10 hover:bg-white/5 text-slate-400'}`}
                      >
                        <span className="flex items-center gap-2 font-medium"><Moon className="w-4 h-4"/> Dark Mode</span>
                        <div className={`w-4 h-4 rounded-full ${themePref === 'dark' ? 'bg-indigo-500 border-4 border-indigo-500/30' : 'border-2 border-slate-500'}`}></div>
                      </button>
                      <button 
                        onClick={() => {
                          setThemePref('light');
                          alert("Light mode is under development! Switching to mock state.");
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl transition-colors ${themePref === 'light' ? 'border border-indigo-500/50 bg-indigo-500/10 text-indigo-200' : 'border border-white/10 hover:bg-white/5 text-slate-400'}`}
                      >
                        <span className="flex items-center gap-2 font-medium"><Sun className="w-4 h-4"/> Light Mode</span>
                        <div className={`w-4 h-4 rounded-full ${themePref === 'light' ? 'bg-indigo-500 border-4 border-indigo-500/30' : 'border-2 border-slate-500'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subscription Page */}
            {activeTab === 'subscription' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
                  <p className="text-slate-400">Manage your current plan and limits.</p>
                </div>
                
                <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">Pro Plan</h2>
                        <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">Active</span>
                      </div>
                      <p className="text-indigo-200">You are currently on the Pro plan billed annually.</p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-3xl font-black text-white">$49<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                      <p className="text-xs text-slate-400 mt-1">Renews on Oct 14, 2026</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                    <button className="px-6 py-3 rounded-xl bg-white text-[#0a0f18] font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg">
                      Upgrade to Enterprise
                    </button>
                    <button className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors">
                      Cancel Plan
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing History Page */}
            {activeTab === 'billing' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Billing History</h1>
                  <p className="text-slate-400">View and download your past invoices.</p>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-4 md:p-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="p-4 md:p-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="p-4 md:p-6 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="p-4 md:p-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { date: "Oct 14, 2026", amount: "$49.00", status: "Paid" },
                        { date: "Sep 14, 2026", amount: "$49.00", status: "Paid" },
                        { date: "Aug 14, 2026", amount: "$49.00", status: "Paid" },
                        { date: "Jul 14, 2026", amount: "$49.00", status: "Paid" },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 md:p-6 text-sm text-slate-200">{item.date}</td>
                          <td className="p-4 md:p-6 text-sm font-medium text-white">{item.amount}</td>
                          <td className="p-4 md:p-6 text-sm hidden sm:table-cell">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 md:p-6 text-right">
                            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors text-sm font-medium">
                              <Download className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* API Usage Page */}
            {activeTab === 'api' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">API Usage</h1>
                  <p className="text-slate-400">Track your token consumption for the current billing cycle.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Zap className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Spatial Engine v1</h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">842,000 <span className="text-lg font-medium text-slate-500">/ 1M tokens</span></div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '84.2%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right">Resets in 8 days</p>
                  </div>
                  
                  <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Vector Storage</h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">2.4 <span className="text-lg font-medium text-slate-500">/ 10 GB</span></div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right">Healthy capacity</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-4">
                  <Activity className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-100 mb-1">High Volume Alert</h4>
                    <p className="text-sm text-indigo-200/80">You've consumed 84% of your monthly Spatial Engine tokens. Consider upgrading to the Enterprise plan if you anticipate higher traffic.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
