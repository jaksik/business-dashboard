// app/api/youtube/analytics/[channelId]/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await ctx.params; // await params per Next.js requirement

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: { message: "No access token" } },
      { status: 401 }
    );
  }

  const end = new Date();
  const start = new Date(end.getTime() - 27 * 24 * 3600 * 1000); // last 28 days

  const qs = new URLSearchParams({
    ids: `channel==${channelId}`, // explicit UC… id
    startDate: iso(start),
    endDate: iso(end),
    metrics: "views,subscribersGained,subscribersLost",
    // omit dimensions => one summary row
  });

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${qs.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data?.error ?? data }, { status: res.status });
  }

  const row = Array.isArray(data?.rows) && data.rows[0] ? data.rows[0] : [0, 0, 0];
  const [views, gained, lost] = row.map((n: number | string) => Number(n) || 0);

  return NextResponse.json({
    views,
    netSubscribers: gained - lost,
  });
}
