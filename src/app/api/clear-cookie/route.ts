import { NextResponse } from "next/server";

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Clear the rosterPayload cookie server-side (works for HttpOnly cookies)
  response.cookies.set("rosterPayload", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
