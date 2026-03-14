import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";
import { parseDetailedSchedule, parseCalendarSchedule, generateEvents } from "@/lib/parser";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { detailedText, calendarText, rank } = await req.json();
    const isCap = rank === 'CAP';

    // 1. Parsing
    const sortedFlights = detailedText ? parseDetailedSchedule(detailedText) : [];
    const calEvents = calendarText ? parseCalendarSchedule(calendarText) : [];

    // 2. Event Generation
    const { events, perDiemTotal, flightsCount, totalFlightTimeMs } = generateEvents(sortedFlights, calEvents, isCap);

    // 3. Calendar Sync Mode (using the user's accessToken if passed directly or via DB)
    // Note: NextAuth v5 requires extending the session to retrieve the access_token.
    // For demonstration, we will intercept the token in auth.ts callback or mock this step 
    // if no token is available for this demo run.

    // *Ideally*, we would do this here:
    // const oauth2Client = new google.auth.OAuth2();
    // oauth2Client.setCredentials({ access_token: session.accessToken });
    // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // for (const ev of events) {
    //   await calendar.events.insert({ calendarId: 'primary', requestBody: ev });
    // }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully parsed ${flightsCount} flights!`,
      perDiemTotal,
      flightsCount,
      totalFlightTimeMs,
      events // Added so the client can preview them
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}

