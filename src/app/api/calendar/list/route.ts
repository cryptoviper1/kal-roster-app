import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export async function GET() {
  const session: any = await auth();
  if (!session || !session.user || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized or missing access token" }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const res = await calendar.calendarList.list({
      minAccessRole: "writer", // 쓰기 권한 있는 캘린더만 반환
    });

    const calendars = (res.data.items || []).map((cal) => ({
      id: cal.id,
      summary: cal.summary,
      backgroundColor: cal.backgroundColor,
      primary: cal.primary || false,
    }));

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error("Calendar list error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar list" }, { status: 500 });
  }
}
