import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth"; 

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated or access token missing" }, { status: 401 });
  }

  // 1. Get the Channel IDs from your environment variables
  const channelIds = process.env.YOUTUBE_CHANNEL_IDS;

  if (!channelIds) {
    console.error("YOUTUBE_CHANNEL_IDS not set in .env.local file.");
    return NextResponse.json({ error: "YouTube Channel IDs are not configured on the server." }, { status: 500 });
  }

  const accessToken = session.accessToken;
  // 2. Build the URL using the 'id' parameter with your comma-separated list of IDs
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "Failed to fetch from YouTube API", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "No YouTube channels found for the provided IDs." }, { status: 404 });
    }
    
    // 3. Map the results into the same structure your display page expects
    interface YouTubeChannel {
        id: string;
        snippet: {
            title: string;
            thumbnails: {
                default: {
                    url: string;
                }
            }
        };
        statistics: {
            subscriberCount: string;
            viewCount: string;
            videoCount: string;
        }
    }

    const channelsData = data.items.map((channel: YouTubeChannel) => ({
        id: channel.id,
        title: channel.snippet.title,
        thumbnailUrl: channel.snippet.thumbnails.default.url,
        statistics: {
            subscribers: channel.statistics.subscriberCount,
            views: channel.statistics.viewCount,
            videos: channel.statistics.videoCount,
        }
    }));
    
    return NextResponse.json(channelsData);

  } catch (error) {
    console.error("An unexpected error occurred in the API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

