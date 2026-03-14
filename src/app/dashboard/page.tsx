import { auth, signOut } from "../../auth";
import { LogOut } from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

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
          {session.user.image ? (
            <Image 
              src={session.user.image} 
              alt="Profile" 
              width={48} 
              height={48} 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.avatar} />
          )}
          <div>
            <h2 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Welcome back,</h2>
            <p className="subtitle" style={{ fontSize: '1rem' }}>{session.user.name}</p>
          </div>
        </div>
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <button type="submit" className="glass-button">
            <LogOut size={18} /> Sign Out
          </button>
        </form>
      </header>

      <DashboardClient initialData={initialRosterData} />
    </main>
  );
}
