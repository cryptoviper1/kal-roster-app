import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseDetailedSchedule, parseCalendarSchedule, generateEvents } from "@/lib/parser";

export async function POST(req: Request) {

  try {
    const { detailedText, calendarText } = await req.json();

    // 1. Parsing
    const sortedFlights = detailedText ? parseDetailedSchedule(detailedText) : [];
    const calEvents = calendarText ? parseCalendarSchedule(calendarText) : [];

    // 2. Event Generation — calculate for both ranks so client can toggle
    const resultFO = generateEvents(sortedFlights, calEvents, false);
    const resultCAP = generateEvents(sortedFlights, calEvents, true);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully parsed ${resultFO.flightsCount} flights!`,
      perDiemFO: resultFO.perDiemTotal,
      perDiemCAP: resultCAP.perDiemTotal,
      flightsCount: resultFO.flightsCount,
      totalFlightTimeMs: resultFO.totalFlightTimeMs,
      events: resultFO.events
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}

