import { signIn } from "../auth";
import { PlaneTakeoff } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.iconWrapper}>
          <PlaneTakeoff size={40} />
        </div>
        <h1 className="title-gradient">KAL Roster</h1>
        <p className="subtitle">
          Sync your Korean Air flight schedule to Google Calendar with one click.
        </p>

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
      </div>
    </main>
  );
}
