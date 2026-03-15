import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors" style={{ textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-8">
        개인정보처리방침 (Privacy Policy)
      </h1>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-gray-600 mb-6">최종 수정일: 2026년 3월 15일</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 수집하는 개인정보의 항목 및 수집 방법</h2>
          <p>
            KAL Roster App(이하 &quot;본 서비스&quot;)은 구글 캘린더 연동 및 스케줄 관리를 위해 다음과 같은 최소한의 개인정보를 수집합니다.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>필수 수집 항목:</strong> 구글 계정 이메일 주소, 이름, 프로필 사진 (Google OAuth 인증 시 제공받음)</li>
            <li><strong>선택 수집 항목:</strong> 구글 캘린더 접근 권한 (사용자가 스케줄 동기화를 요청할 때만 캘린더 이벤트의 읽기/쓰기 권한을 요청합니다.)</li>
            <li><strong>서비스 이용 중 자동 수집 항목:</strong> IP 주소, 쿠키, 서비스 이용 기록 (세션 관리를 위해 사용)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 수집 및 이용 목적</h2>
          <p>본 서비스는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>회원 관리:</strong> Google 계정을 기반으로 한 사용자 식별 및 로그인 유지</li>
            <li><strong>핵심 서비스 제공:</strong> 사용자가 입력한 항공 스케줄(텍스트 등)을 분석하고, 이를 사용자의 명시적 동의하에 사용자의 구글 캘린더에 일정으로 등록하거나 업데이트/삭제하는 기능 제공</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 구글 사용자 데이터(Google User Data)의 취급</h2>
          <p>
            본 서비스는 구글 API 서비스 이용 약관 및 구글 API 서비스 사용자 데이터 정책(Google API Services User Data Policy)을 엄격히 준수합니다.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>본 서비스는 오직 스케줄 동기화(구글 캘린더에 이벤트 추가, 본 앱이 생성한 기존 이벤트 삭제) 목적으로만 구글 캘린더 API를 사용합니다.</li>
            <li>사용자의 캘린더 일정이나 이메일 등의 데이터를 외부 제3자와 일절 공유하거나 판매하지 않습니다.</li>
            <li>본 서비스는 캘린더에 일정을 생성하는 데 필요한 최소한의 데이터만 처리하며, 앱 데이터베이스에 사용자의 기존 개인 캘린더 일정을 따로 저장하지 않습니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 보유 및 이용 기간</h2>
          <p>
            원칙적으로 사용자가 서비스에서 탈퇴(혹은 구글 계정 연결 해제) 시, 또는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            단, 관련 법령에 의해 보존할 필요가 있는 경우 법령이 정한 기간 동안 보존합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 파기절차 및 방법</h2>
          <p>
            사용자가 서비스 이용을 중단하고 구글 계정 연동을 해제하면, 서버 내 보관된 식별 정보(세션 등)는 즉각 파기됩니다. 데이터베이스 형태의 영구 저장을 최소화하여 프라이버시를 보호합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 문의처</h2>
          <p>
            본 개인정보처리방침이나 서비스 이용과 관련한 문의사항이 있으시면 아래 이메일로 연락해 주시기 바랍니다.<br />
            <strong>[운영자 이메일 주소 기입]</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
