import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const rosterData = formData.get("rosterData");

    if (rosterData && typeof rosterData === "string") {
      const cookieStore = await cookies();
      cookieStore.set("rosterPayload", encodeURIComponent(rosterData), {
        path: "/",
        maxAge: 60, // Only keep it for 60 seconds (enough time to redirect and read)
        httpOnly: true,
      });
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    return NextResponse.redirect(new URL("/dashboard?error=upload_failed", req.url));
  }
}
