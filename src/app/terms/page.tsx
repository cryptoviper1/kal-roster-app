import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#e2e8f0', lineHeight: '1.6' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#60a5fa', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '32px', transition: 'opacity 0.2s' }} className="hover:opacity-80">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '32px' }}>
        서비스 이용약관 (Terms of Service)
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <p style={{ color: '#9ca3af' }}>최종 수정일: 2026년 3월 15일</p>

        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>제 1 조 (목적)</h2>
          <p>
            본 약관은 사용자가 KAL Roster App(이하 "서비스")이 제공하는 비행 스케줄 변환 및 구글 캘린더 동기화 서비스를 이용함에 있어, 서비스와 사용자 간의 권리, 의무, 책임사항 및 기본적인 이용 조건을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>제 2 조 (제공되는 서비스)</h2>
          <p style={{ marginBottom: '8px' }}>본 서비스는 다음과 같은 주요 기능을 제공합니다.</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>사용자가 제공한 항공 스케줄(텍스트, 이미지 등) 데이터를 분석 및 변환.</li>
            <li>사용자의 개별 동의하에, 구글 캘린더(Google Calendar)에 변환된 비행 및 훈련 일정을 등록.</li>
            <li>사용자가 동기화했던 기존 스케줄(본 앱이 캘린더에 작성한 이벤트)을 업데이트하거나 삭제하는 기능.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>제 3 조 (사용자의 의무 및 제한 사항)</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>사용자는 본 서비스를 이용할 때, 본인의 정확한 스케줄 정보만 사용해야 하며 타인의 정보를 무단으로 이용하거나 타인의 구글 계정을 도용해서는 안 됩니다.</li>
            <li>사용자는 본 서비스를 불법적인 목적, 상업적 이익, 또는 시스템에 무리를 주는 크롤링/봇 등의 자동화된 방식으로 이용할 수 없습니다.</li>
            <li>본 서비스에서 산출되는 예상 체류비(Per Diem) 및 블록 타임(Block Time)은 편의를 위해 제공되는 <strong>추정치</strong>이며, 실제 회사의 지급액이나 비행 기록과 다를 수 있습니다. 이에 대한 법적, 금전적 책임은 전적으로 사용자 본인에게 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>제 4 조 (구글 계정 연동 및 API 사용)</h2>
          <p style={{ marginBottom: '8px' }}>
            서비스의 핵심 기능을 사용하기 위해서는 Google OAuth 연동이 필수적입니다.
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>사용자가 계정 연결을 허용함으로써 본 서비스는 스케줄 추가 권한을 획득합니다.</li>
            <li>본 권한은 언제든지 사용자의 구글 계정 보안 설정에서 직접 철회할 수 있습니다.</li>
            <li>본 서비스는 Google 정책 가이드라인을 준수하며, 사용자 데이터 사용에 대한 상세 내용은 [개인정보처리방침]에 따릅니다.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>제 5 조 (책임의 한계 및 면책)</h2>
          <p style={{ marginBottom: '12px' }}>
            운영자는 무료로 제공되는 본 서비스의 안정적인 운영을 위해 최선을 다하나, 통신망 오류, 구글 API의 정책 변경, 혹은 제공된 원본 데이터의 오기입 등으로 인해 발생한 일정 등록 누락, 스케줄 오버랩, 체류비 계산 착오 등의 결과에 대해서는 <strong>일절 책임을 지지 않습니다.</strong>
          </p>
          <p style={{ color: '#f87171', fontWeight: 'bold' }}>
            특히 캘린더 연동 오류로 인한 비행 스케줄 지각/결함(Show up failure) 등의 치명적 책임에 대해 개발자 및 운영자는 면책됩니다. 반드시 최종 스케줄은 공식 채널을 통해 재확인하시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}
