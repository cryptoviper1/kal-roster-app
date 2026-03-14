"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, TerminalSquare, CheckCircle2 } from "lucide-react";

export default function BookmarkletGuide() {
  const [copied, setCopied] = useState(false);

  const bookmarkletCode = `javascript:(function(){
    try {
      if(!window.location.href.includes('kr/crewschedule')) {
        alert('이 북마크릿은 대한항공 스케줄 웹 화면에서만 작동합니다.');
        return;
      }
      
      const payload = {
        calendarText: document.querySelector('.my-schedule-calendar')?.innerText || '',
        detailedText: document.querySelector('.my-schedule-detail')?.innerText || ''
      };
      
      if(!payload.calendarText && !payload.detailedText) {
        alert('스케줄 텍스트를 찾을 수 없습니다. HTML(상세정보) 창이 열려있는지 확인하세요.');
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/bookmarklet';
      form.target = '_blank';
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'rosterData';
      input.value = JSON.stringify(payload);
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch(e) {
      alert('데이터 추출 중 오류가 발생했습니다.');
    }
  })();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LinkIcon size={20} color="#60a5fa" /> 1-Click Bookmarklet 설치
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        사파리나 크롬 즐겨찾기(북마크)에 아래 코드를 주소 대신 저장해두세요. KAL 스케줄 화면에서 저장해둔 즐겨찾기를 누르면 <b>바로 이곳으로 데이터가 전송됩니다.</b>
      </p>
      
      <div style={{ position: 'relative', background: '#0a101d', borderRadius: '8px', padding: '16px', overflow: 'hidden' }}>
        <code style={{ fontSize: '0.8rem', color: '#93c5fd', wordBreak: 'break-all', display: 'block' }}>
          {bookmarkletCode.substring(0, 100)}...
        </code>
        <button 
          onClick={copyToClipboard}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
        >
          {copied ? <CheckCircle2 size={14} color="#4ade80" /> : <Copy size={14} />} 
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
    </div>
  );
}
