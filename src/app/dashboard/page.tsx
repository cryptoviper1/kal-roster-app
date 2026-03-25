import { auth, signOut } from "../../auth";
import { LogOut, User, Youtube } from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Check if there is payload data stashed in cookies from the Bookmarklet
  const cookieStore = await cookies();
  const rosterDataRaw = cookieStore.get('rosterPayload')?.value;
  let initialRosterData = null;
  
  if (rosterDataRaw) {
    try {
      initialRosterData = JSON.parse(decodeURIComponent(rosterDataRaw));
    } catch(e) {}
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profile}>
          {isLoggedIn && session?.user?.image ? (
            <Image 
              src={session.user.image} 
              alt="Profile" 
              width={48} 
              height={48} 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
              <User size={24} color="#9ca3af" />
            </div>
          )}
          <div>
            <h2 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              {isLoggedIn ? "Welcome back," : "Welcome,"}
            </h2>
            <p className="subtitle" style={{ fontSize: '1rem' }}>
              {isLoggedIn ? session?.user?.name : "Guest Pilot"}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://youtu.be/EpiMilNxGXo" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#f87171', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }} className="hover:text-white transition-colors">
            <Youtube size={16} /> Guide Video
          </a>
          <a href="/privacy" style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'none' }} className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'none' }} className="hover:text-white transition-colors">Terms</a>
          {isLoggedIn ? (
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button type="submit" className="glass-button">
                <LogOut size={18} /> Sign Out
              </button>
            </form>
          ) : (
            <a href="/" className="glass-button" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Sign In
            </a>
          )}
        </div>
      </header>

      <DashboardClient initialData={initialRosterData} isLoggedIn={isLoggedIn} />
    </main>
  );
}
