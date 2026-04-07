"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, UploadCloud, Plane, CheckCircle2, Eye, CalendarCheck, BookOpen, Clock, ShieldAlert, ExternalLink, Heart, Users, Trash2, Building, Download } from "lucide-react";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import BookmarkletGuide from "./BookmarkletGuide";

export default function DashboardClient({ initialData, isLoggedIn = false }: { initialData?: any, isLoggedIn?: boolean }) {
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
  const [calendars, setCalendars] = useState<{ id: string; summary: string; backgroundColor: string; primary: boolean }[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState("primary");
  const [isFetchingCalendars, setIsFetchingCalendars] = useState(false);
  const [warningModal, setWarningModal] = useState<{ title: string; message: string; cText: string; dText: string } | null>(null);

  useEffect(() => {
    if (initialData && initialData.calendarText) {
      setCalText(initialData.calendarText);
      setDetText(initialData.detailedText || "");

      // Clear the HttpOnly cookie server-side (can't be done via document.cookie)
      fetch("/api/clear-cookie", { method: "DELETE" }).catch(console.error);

      // Auto-parse with proper error handling
      handleParsePreviewDirect(initialData.calendarText, initialData.detailedText || "")
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initialData comes from server once; empty deps prevents re-parse on re-render


  const handleParsePreviewDirect = async (cText: string, dText: string) => {
    if (!cText && !dText) {
      alert("복사한 텍스트를 입력해주세요! (Please paste your schedule text first!)");
      return;
    }

    if (!cText && dText) {
      setWarningModal({
        title: "1번 창 누락 (My Schedule)",
        message: "이대로 진행할 경우 휴무(DO), 대기(STBY), 병가(SICK) 등 기본 일정이 달력에 전혀 등록되지 않습니다.\n\n계속 파싱을 진행하시겠습니까?",
        cText,
        dText
      });
      return;
    }

    if (cText && !dText) {
      setWarningModal({
        title: "2번 창 누락 (Crew Roster Report)",
        message: "이대로 진행할 경우 비행 스케줄의 상세 정보(출도착 시간, 크루 명단, 체류비 등)가 누락된 채 날짜만 표기됩니다.\n\n계속 파싱을 진행하시겠습니까?",
        cText,
        dText
      });
      return;
    }
    
    executeParse(cText, dText);
  };

  const executeParse = async (cText: string, dText: string) => {
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

  const fetchCalendars = async () => {
    if (calendars.length > 0 || isFetchingCalendars) return;
    setIsFetchingCalendars(true);
    try {
      const res = await fetch("/api/calendar/list");
      const data = await res.json();
      if (res.ok && data.calendars) {
        setCalendars(data.calendars);
      }
    } catch (e) {
      console.error("Failed to fetch calendars", e);
    } finally {
      setIsFetchingCalendars(false);
    }
  };

  const handleFinalSync = async () => {
    setIsSyncing(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: previewEvents, calendarId: selectedCalendarId }),
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

  const handleDownloadCSV = () => {
    if (previewEvents.length === 0) return;

    let csvContent = "Subject,Start Date,Start Time,End Date,End Time,Description,Location\n";

    previewEvents.forEach(ev => {
      const subject = `"${ev.summary.replace(/"/g, '""')}"`;
      const description = ev.description ? `"${ev.description.replace(/"/g, '""')}"` : "";
      const location = ev.location ? `"${ev.location.replace(/"/g, '""')}"` : "";

      let startDate = "";
      let startTime = "All Day";
      let endDate = "";
      let endTime = "All Day";

      if (ev.start?.date) {
        startDate = ev.start.date; 
        endDate = ev.end.date;
      } else {
        const s = new Date(ev.start?.dateTime);
        const e = new Date(ev.end?.dateTime);
        
        startDate = `${s.getMonth() + 1}/${s.getDate()}/${s.getFullYear()}`;
        startTime = s.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
        
        endDate = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()}`;
        endTime = e.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
      }

      csvContent += `${subject},${startDate},${startTime},${endDate},${endTime},${description},${location}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "flight_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMsg("🎉 Schedule downloaded as CSV! You can now import it into your calendar.");
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FLT': return <Plane size={16} color="#60a5fa" />;
      case 'GND': return <BookOpen size={16} color="#4ade80" />;
      case 'TRG': return <Building size={16} color="#c084fc" />;
      case 'RSV': return <ShieldAlert size={16} color="#f87171" />;
      case 'SICK': return <ShieldAlert size={16} color="#f87171" />;
      case 'STBY': return <Clock size={16} color="#fbbf24" />;
      case 'MEDCHK': return <Heart size={16} color="#f472b6" />;
      case 'UNION': return <Users size={16} color="#fb923c" />;
      default: return <Calendar size={16} color="#94a3b8" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'FLT': return '#93c5fd';
      case 'GND': return '#86efac';
      case 'TRG': return '#d8b4fe';
      case 'RSV': return '#fca5a5';
      case 'SICK': return '#fca5a5';
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
            <div className={styles.cardTitle} style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#a78bfa" /> Schedule Preview ({previewEvents.length} events)
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
                <button 
                  onClick={handleDownloadCSV}
                  className="secondary-button"
                  style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minWidth: '200px', gap: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px' }}
                >
                  <Download size={18} /> Download CSV
                </button>
                
                {isLoggedIn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '200px' }}>
                    <select
                      value={selectedCalendarId}
                      onChange={(e) => setSelectedCalendarId(e.target.value)}
                      onFocus={fetchCalendars}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <option value="primary" style={{ background: '#1e293b' }}>
                        📅 {isFetchingCalendars ? '불러오는 중...' : '기본 캘린더 (Google Calendar)'}
                      </option>
                      {calendars.filter(c => !c.primary).map((cal) => (
                        <option key={cal.id} value={cal.id!} style={{ background: '#1e293b' }}>
                          🗓 {cal.summary}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleFinalSync}
                      disabled={isSyncing}
                      className="primary-button"
                      style={{ background: '#10b981', padding: '10px 20px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: isSyncing ? 'wait' : 'pointer', opacity: isSyncing ? 0.7 : 1, border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}
                    >
                      <CalendarCheck size={18} /> {isSyncing ? "Syncing..." : "Sync to Google Calendar"}
                    </button>
                  </div>
                ) : (
                  <a 
                    href="/"
                    className="primary-button"
                    style={{ background: '#60a5fa', padding: '10px 20px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minWidth: '200px', gap: '8px', cursor: 'pointer', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Sign in to Sync
                  </a>
                )}
              </div>
            </div>
            
            {successMsg.includes("🎉") && (
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#4ade80', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
                {successMsg}
              </div>
            )}

            <div style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
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

      <AnimatePresence>
        {warningModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`glass-panel`}
              style={{ width: '100%', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '24px' }}
            >
              <h3 style={{ margin: '0 0 16px 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <ShieldAlert size={24} /> {warningModal.title}
              </h3>
              <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                {warningModal.message}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setWarningModal(null)}
                  style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', flex: 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  돌아가기
                </button>
                <button 
                  onClick={() => {
                    setWarningModal(null);
                    executeParse(warningModal.cText, warningModal.dText);
                  }}
                  style={{ padding: '10px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', flex: 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                >
                  무시하고 진행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
