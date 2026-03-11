import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './components/Login';
import { ComplaintForm } from './components/ComplaintForm';
import { Dashboard } from './components/Dashboard';
import { StatusTracker } from './components/StatusTracker';
import { db, auth } from './firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDocFromServer } from 'firebase/firestore';
import { Complaint } from './types';
import { Shield, Plus, List, LayoutDashboard, ChevronRight, MapPin, Clock, WifiOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isOfficial } = useAuth();
  const [activeTab, setActiveTab] = useState<'report' | 'my-complaints' | 'dashboard'>('report');
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (isOfficial) {
      setActiveTab('dashboard');
    }
  }, [isOfficial]);
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    setIsRetrying(true);
    try {
      await getDocFromServer(doc(db, '_connection_test_', 'init'));
      setIsOffline(false);
    } catch (error: any) {
      if (error.message.includes('offline') || error.message.includes('Could not reach')) {
        setIsOffline(true);
      } else {
        // Permission denied or other errors mean we reached the server
        setIsOffline(false);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'my-complaints') {
      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMyComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
      }, (error) => {
        console.error("Firestore Error (My Complaints):", error);
      });
      return () => unsubscribe();
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        {isOffline && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm font-bold animate-in slide-in-from-top duration-300">
            <WifiOff className="w-4 h-4" />
            <span>Firestore is offline. Check your connection or Firebase config.</span>
            <button 
              onClick={checkConnection}
              disabled={isRetrying}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRetrying && "animate-spin")} />
              RETRY
            </button>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 vibrant-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight hidden sm:block">CivicBridge</h1>
          </div>
          <Login />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-8 w-fit mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('report')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'report' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Plus className="w-4 h-4" />
            REPORT ISSUE
          </button>
          <button
            onClick={() => setActiveTab('my-complaints')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === 'my-complaints' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List className="w-4 h-4" />
            MY REPORTS
          </button>
          {isOfficial && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'dashboard' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              OFFICIAL DASHBOARD
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'report' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center sm:text-left">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Report a New Issue</h2>
                  <p className="text-slate-500">Help us improve your community by reporting civic problems.</p>
                </div>
                <ComplaintForm onSuccess={() => {
                  console.log("Complaint submitted successfully, switching to My Reports tab");
                  setActiveTab('my-complaints');
                }} />
              </div>
            )}

            {activeTab === 'my-complaints' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Reports</h2>
                  <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                    {myComplaints.length} TOTAL
                  </span>
                </div>
                
                {myComplaints.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <List className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">You haven't reported any issues yet.</p>
                    <button 
                      onClick={() => setActiveTab('report')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Start your first report
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {myComplaints.map(complaint => (
                      <div key={complaint.id} className="glass-card p-6 rounded-3xl space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{complaint.category}</span>
                            <h3 className="text-lg font-bold text-slate-900">{complaint.description}</h3>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">#{complaint.id.slice(0, 8)}</span>
                        </div>
                        
                        <StatusTracker currentStatus={complaint.status} />
                        
                        {complaint.location && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-start">
                            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                              {complaint.location.address ? (
                                <p className="text-sm text-slate-600 leading-relaxed">{complaint.location.address}</p>
                              ) : (
                                <p className="text-xs font-mono text-slate-500">
                                  {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-xs text-slate-400 font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reported {format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && isOfficial && <Dashboard />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
