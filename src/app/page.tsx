import { signIn } from "../auth";
import { PlaneTakeoff, ShieldAlert, CalendarSync, Lock, Zap, Youtube } from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.iconWrapper}>
          <PlaneTakeoff size={40} />
        </div>
        <h1 className={`title-gradient ${styles.heroTitle}`}>KAL FlightSchedule</h1>
        <p className={styles.heroSubtitle}>
          Effortlessly sync your Korean Air flight schedule to Google Calendar. 
          A simple, secure, and smart tool designed for KAL crew members.
        </p>

        {/* Login / Actions Card */}
        <div className={`glass-panel ${styles.loginCard}`}>
          <h2 style={{ fontSize: '1.25rem', color: '#f3f4f6', marginBottom: '16px' }}>Ready to sync your schedule?</h2>
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

          <a 
            href="/dashboard" 
            className="secondary-button" 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '16px', 
              marginTop: '12px', 
              textAlign: 'center', 
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#d1d5db',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Continue without Google
          </a>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.85rem',
            color: '#9ca3af',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <ShieldAlert size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: '#e5e7eb' }}>Google Verification Notice:</strong> During our app verification process, you may see an "Unverified App" warning. You can safely proceed by clicking <b>Advanced ➡️ Go to KAL FlightSchedule (unsafe)</b>.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Zap size={32} />
          </div>
          <h3 className={styles.featureTitle}>One-Click Parsing</h3>
          <p className={styles.featureDescription}>
            Simply paste your monthly KAL text schedule. Our smart parser instantly identifies your flights, ground duties, and per diems.
          </p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <CalendarSync size={32} />
          </div>
          <h3 className={styles.featureTitle}>Seamless Sync</h3>
          <p className={styles.featureDescription}>
            Export your processed schedule directly into your Google Calendar. We handle the timezones and event formatting automatically.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Lock size={32} />
          </div>
          <h3 className={styles.featureTitle}>Privacy First</h3>
          <p className={styles.featureDescription}>
            We act purely as a calculator. No schedules or personal data are ever saved to our servers. Your data stays entirely in your browser and your Google account.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="https://youtu.be/opCVI8M1AkI" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 600 }}>
            <Youtube size={16} /> Guide Video
          </a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/privacy">Privacy Policy</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/terms">Terms of Service</a>
        </div>
        <p className={styles.footerText}>
          KAL FlightSchedule is an independent tool created for KAL crew members. It is not affiliated with, endorsed by, or connected to Korean Air in any official capacity.
        </p>
      </footer>
    </main>
  );
}
