'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedLayout } from "../../components/auth/protected-layout"

// Type definitions for the channel data we expect from the API
interface ChannelStatistics {
  subscribers: string;
  views: string;
  videos: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  statistics: ChannelStatistics;
}

export default function YouTubeAnalyticsPage() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<YouTubeChannel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically sign out if the session contains a token refresh error
    // if (session?.error === "RefreshAccessTokenError") {
    //   signOut({ callbackUrl: '/auth/signin' });
    // }
  }, [session]);

  useEffect(() => {
    async function fetchYouTubeChannels() {
      try {
        const response = await fetch('/api/youtube/stats');

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
          throw new Error("Your session has likely expired. Please sign out and sign back in.");
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        const data = await response.json();
        const channelsArray = Array.isArray(data) ? data : [data];
        setChannels(channelsArray);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchYouTubeChannels();
  }, []);

  // REDESIGNED: StatCard is more compact for the inline layout
  const StatCard = ({ title, value, colorClass }: { title: string, value: string, colorClass: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
  
  // REDESIGNED: Skeleton matches the new inline, responsive layout
  const ChannelSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border animate-pulse flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
        <div className="flex-shrink-0 flex items-center space-x-4 w-full md:w-72">
            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
  );

  return (
    <ProtectedLayout title="YouTube Channel Analytics">
      <div className="space-y-6">

        {loading && <ChannelSkeleton />}

        {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            An error occurred: <span className="font-medium">{error}</span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* REDESIGNED: Main channel mapping now uses a flex layout */}
        {!loading && !error && channels && channels.map((channel) => (
          <div key={channel.id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
            
            {/* Left side: Channel Info - Now inline */}
            <div className="flex-shrink-0 flex items-center space-x-4 w-full md:w-72">
                <img src={channel.thumbnailUrl} alt={`${channel.title} thumbnail`} className="w-16 h-16 rounded-full shadow-md" />

                <h2 className="text-2xl font-bold text-gray-800 truncate">{channel.title}</h2>
            </div>

            {/* Right side: Stats Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Subscribers"
                  value={Number(channel.statistics?.subscribers || '0').toLocaleString()}
                  colorClass="text-red-600"
                />
                <StatCard 
                  title="Total Views"
                  value={Number(channel.statistics?.views || '0').toLocaleString()}
                  colorClass="text-indigo-600"
                />
                <StatCard 
                  title="Total Videos"
                  value={Number(channel.statistics?.videos || '0').toLocaleString()}
                  colorClass="text-teal-600"
                />
            </div>
          </div>
        ))}
      </div>
    </ProtectedLayout>
  )
}

