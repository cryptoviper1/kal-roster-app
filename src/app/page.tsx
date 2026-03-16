import { signIn } from "../auth";
import { PlaneTakeoff, ShieldAlert } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.iconWrapper}>
          <PlaneTakeoff size={40} />
        </div>
        <h1 className="title-gradient">KAL FlightSchedule</h1>
        <p className="subtitle">
          Sync your Korean Air flight schedule to Google Calendar with one click.
        </p>

        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem',
          color: '#9ca3af',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: '#e5e7eb' }}>보안 경고창 안내:</strong> 아직 구글 정식 심사 전이므로 <b>"확인되지 않은 앱(Unverified App)"</b> 경고가 뜰 수 있습니다. 당황하지 마시고 <b>[고급(Advanced)] ➡️ [이동(안전하지 않음)]</b>을 누르시면 정상 이용 가능합니다.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: '#e5e7eb' }}>개인정보 보호:</strong> 본 서비스는 스케줄 파싱 및 달력 연동을 위한 <b>단순 계산기</b> 역할만 수행하며, 어떠한 개인정보나 스케줄 데이터도 서버에 절대 <b>저장하지 않습니다.</b> 안심하고 사용하세요!
            </span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className={styles.formWrapper}
        >
          <button type="submit" className={`primary-button ${styles.loginButton}`}>
            Get Started with Google
          </button>
        </form>
        
        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.85rem' }}>
          <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Privacy Policy</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Terms of Service</a>
        </div>
      </div>
    </main>
  );
}
