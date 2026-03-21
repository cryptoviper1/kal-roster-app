"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, UploadCloud, Plane, CheckCircle2, Eye, CalendarCheck, BookOpen, Clock, ShieldAlert, ExternalLink, Heart, Users, Trash2 } from "lucide-react";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import BookmarkletGuide from "./BookmarkletGuide";

export default function DashboardClient({ initialData }: { initialData?: any }) {
  const [calText, setCalText] = useState("");
  const [detText, setDetText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedRank, setSelectedRank] = useState<'FO' | 'CAP'>('FO');
  const [stats, setStats] = useState({
    flights: 0,
    perDiemFO: { usd: 0, eur: 0, krw: 0 },
    perDiemCAP: { usd: 0, eur: 0, krw: 0 },
    flightTimeMs: 0
  });
  const [previewEvents, setPreviewEvents] = useState<any[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  useEffect(() => {
    if (initialData && initialData.calendarText) {
      setCalText(initialData.calendarText);
      setDetText(initialData.detailedText || "");
      
      // Clear the cookie so it doesn't re-inject on refresh
      document.cookie = 'rosterPayload=; Max-Age=0; path=/';
      
      // Auto-parse if data exists from Bookmarklet
      handleParsePreviewDirect(initialData.calendarText, initialData.detailedText || "");
    }
  }, [initialData]);

  const handleParsePreviewDirect = async (cText: string, dText: string) => {
    if (!cText && !dText) {
      alert("Please paste your schedule text first!");
      return;
    }
    
    setIsParsing(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          calendarText: cText, 
          detailedText: dText
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStats({
          flights: data.flightsCount,
          perDiemFO: data.perDiemFO || { usd: 0, eur: 0, krw: 0 },
          perDiemCAP: data.perDiemCAP || { usd: 0, eur: 0, krw: 0 },
          flightTimeMs: data.totalFlightTimeMs || 0
        });
        setPreviewEvents(data.events || []);
        setSuccessMsg("Schedule parsed successfully! Please review below.");
      } else {
        alert(data.error || "Parse failed");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setIsParsing(false);
    }
  };

  const handleParsePreview = async () => {
    return handleParsePreviewDirect(calText, detText);
  };

  const handleFinalSync = async () => {
    setIsSyncing(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: previewEvents }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("🎉 " + data.message);
      } else {
        alert(data.error || "Sync failed");
      }
    } catch (e) {
      alert("Something went wrong during sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FLT': return <Plane size={16} color="#60a5fa" />;
      case 'TRG': return <BookOpen size={16} color="#c084fc" />;
      case 'RSV': return <ShieldAlert size={16} color="#f87171" />;
      case 'STBY': return <Clock size={16} color="#fbbf24" />;
      case 'MEDCHK': return <Heart size={16} color="#f472b6" />;
      case 'UNION': return <Users size={16} color="#fb923c" />;
      default: return <Calendar size={16} color="#94a3b8" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'FLT': return '#93c5fd';
      case 'TRG': return '#d8b4fe';
      case 'RSV': return '#fca5a5';
      case 'STBY': return '#fde047';
      case 'MEDCHK': return '#f9a8d4';
      case 'UNION': return '#fdba74';
      default: return 'white';
    }
  };

  return (
    <div className={styles.grid}>
      <div className={`glass-panel ${styles.card}`}>
        <div className={styles.cardTitle}>
          <Calendar size={20} color="#60a5fa" /> This Month's Flights
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={stats.flights}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statsValue}
          >
            {stats.flights}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {stats.flightTimeMs > 0 && (
            <motion.div 
              key={`time-${stats.flightTimeMs}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: '1rem', color: '#60a5fa', fontWeight: 'bold', marginTop: '4px' }}
            >
              {Math.floor(stats.flightTimeMs / 3600000)}h {Math.floor((stats.flightTimeMs % 3600000) / 60000)}m
            </motion.div>
          )}
        </AnimatePresence>
        <p className="subtitle" style={{ fontSize: '0.9rem', marginTop: stats.flightTimeMs > 0 ? '4px' : '0' }}>
          {stats.flights > 0 ? "Flights ready to sync" : "Waiting for schedule upload..."}
        </p>
      </div>
      
      <div className={`glass-panel ${styles.card}`}>
        <div className={styles.cardTitle} style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="#4ade80" /> Est. Per Diem
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setSelectedRank('FO')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedRank === 'FO' ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
                color: selectedRank === 'FO' ? '#4ade80' : '#6b7280',
                boxShadow: selectedRank === 'FO' ? '0 0 8px rgba(74, 222, 128, 0.15)' : 'none'
              }}
            >
              F/O
            </button>
            <button
              onClick={() => setSelectedRank('CAP')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedRank === 'CAP' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                color: selectedRank === 'CAP' ? '#60a5fa' : '#6b7280',
                boxShadow: selectedRank === 'CAP' ? '0 0 8px rgba(96, 165, 250, 0.15)' : 'none'
              }}
            >
              CAPT
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${selectedRank}-${selectedRank === 'FO' ? stats.perDiemFO.usd : stats.perDiemCAP.usd}-${selectedRank === 'FO' ? stats.perDiemFO.eur : stats.perDiemCAP.eur}-${selectedRank === 'FO' ? stats.perDiemFO.krw : stats.perDiemCAP.krw}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statsValue}
            style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div>${(selectedRank === 'FO' ? stats.perDiemFO.usd : stats.perDiemCAP.usd).toFixed(2)}</div>
            {(selectedRank === 'FO' ? stats.perDiemFO.eur : stats.perDiemCAP.eur) > 0 && (
              <div style={{ color: '#10b981' }}>€{(selectedRank === 'FO' ? stats.perDiemFO.eur : stats.perDiemCAP.eur).toFixed(2)}</div>
            )}
            {(selectedRank === 'FO' ? stats.perDiemFO.krw : stats.perDiemCAP.krw) > 0 && (
              <div style={{ color: '#60a5fa' }}>₩{(selectedRank === 'FO' ? stats.perDiemFO.krw : stats.perDiemCAP.krw).toLocaleString()}</div>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="subtitle" style={{ fontSize: '0.9rem' }}>Based on calculated layovers</p>
      </div>

      <div className={`glass-panel ${styles.card}`} style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className={styles.cardTitle}>
            <Plane size={20} color="#60a5fa" /> Parse & Preview Schedule
          </div>
          <a 
            href="https://iflightke.ibsplc.aero/iflight-cwp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="primary-button"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(96, 165, 250, 0.1)', 
              color: '#60a5fa', 
              border: '1px solid rgba(96, 165, 250, 0.3)',
              padding: '8px 16px',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={16} /> Open Koreanair Crew Web Portal
          </a>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ position: 'relative' }}>
            <textarea 
              placeholder="1. Crew Web Portal 에 접속 후, My Shedule 을 선택 후 모든 Text 를 긁어서 복사 한 후 붙여넣기 합니다." 
              value={calText}
              onChange={(e) => setCalText(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '12px', paddingRight: '45px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            {calText && (
              <button 
                onClick={() => setCalText("")}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                title="Clear content"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <textarea 
              placeholder="2. My Shedule 화면에서 Crew Roster Report 를 선택 후 날짜 확인 후 Select Format 에서 Html 을 선택 후 Download 합니다. Download 이후에 나오는 모든 Text를 긁어서(모두 선택) 복사 하여 붙여넣기 합니다." 
              value={detText}
              onChange={(e) => setDetText(e.target.value)}
              style={{ width: '100%', height: '150px', padding: '12px', paddingRight: '45px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            {detText && (
              <button 
                onClick={() => setDetText("")}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                title="Clear content"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={handleParsePreview}
            disabled={isParsing}
            className="primary-button"
            style={{ padding: '16px', fontSize: '1.1rem', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Eye size={20} />
            {isParsing ? "Parsing..." : "Parse Schedule"}
          </button>
          
          <AnimatePresence>
            {successMsg && !successMsg.includes("🎉") && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '8px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle2 />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* <BookmarkletGuide /> (Temporarily hidden per user request) */}
        </div>
      </div>

      <AnimatePresence>
        {previewEvents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel ${styles.card}`} 
            style={{ gridColumn: '1 / -1', marginTop: '8px' }}
          >
           <div className={styles.cardTitle} style={{ justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#a78bfa" /> Schedule Preview ({previewEvents.length} events)
              </div>
              <button 
                onClick={handleFinalSync}
                disabled={isSyncing}
                className="primary-button"
                style={{ background: '#10b981', padding: '10px 20px', fontSize: '0.95rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px', cursor: isSyncing ? 'wait' : 'pointer', opacity: isSyncing ? 0.7 : 1 }}
              >
                <CalendarCheck size={18} /> {isSyncing ? "Syncing to Google..." : "Confirm & Insert to Google Calendar"}
              </button>
            </div>
            
            {successMsg.includes("🎉") && (
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#4ade80', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
                {successMsg}
              </div>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
              {previewEvents.map((ev, idx) => {
                const start = new Date(ev.start.dateTime || ev.start.date);
                const end = new Date(ev.end.dateTime || ev.end.date);
                const dateStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                
                let timeStr = "";
                if (ev.start.date) {
                  timeStr = "All Day";
                } else {
                  timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => setExpandedEvent(expandedEvent === idx ? null : idx)}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: getEventColor(ev.type), display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getEventIcon(ev.type)} {ev.summary}
                      </h4>
                      <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{dateStr}</div>
                        <div>{timeStr}</div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedEvent === idx && ev.description && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            whiteSpace: 'pre-wrap',
                            borderLeft: `3px solid ${getEventColor(ev.type)}`,
                            fontFamily: 'monospace'
                          }}>
                            {ev.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
