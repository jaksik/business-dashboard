// app/(your-segment)/youtube/page.tsx  (your UI page, minimal tweaks)
'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedLayout } from "../../components/auth/protected-layout"

interface ChannelStatistics { subscribers: string; views: string; videos: string; }
interface YouTubeChannel { id: string; title: string; thumbnailUrl: string; statistics: ChannelStatistics; }
interface ChannelAnalytics { views: number; netSubscribers: number; }

export default function YouTubeAnalyticsPage() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<YouTubeChannel[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const [openChannelId, setOpenChannelId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<{ [k: string]: ChannelAnalytics }>({})
  const [analyticsLoading, setAnalyticsLoading] = useState<{ [k: string]: boolean }>({})

  useEffect(() => {
    // if ((session as any)?.error === "RefreshAccessTokenError") signOut({ callbackUrl: '/auth/signin' })
  }, [session])

  useEffect(() => {
    async function fetchYouTubeChannels() {
      try {
        const res = await fetch('/api/youtube/stats')
        if (!res.ok) throw new Error('Failed to fetch channel list')
        const data = await res.json()
        setChannels(Array.isArray(data) ? data : [data])
      } finally {
        setLoading(false)
      }
    }
    fetchYouTubeChannels()
  }, [])

  const fetchAnalyticsForChannel = async (channelId: string) => {
    setAnalyticsLoading(p => ({ ...p, [channelId]: true }))
    try {
      const res = await fetch(`/api/youtube/analytics/${channelId}`)
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error?.message || 'Failed to fetch analytics')
      setAnalyticsData(p => ({ ...p, [channelId]: payload as ChannelAnalytics }))
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyticsLoading(p => ({ ...p, [channelId]: false }))
    }
  }

  const handleToggleChannel = (channelId: string) => {
    const opening = openChannelId !== channelId
    setOpenChannelId(opening ? channelId : null)
    if (opening && !analyticsData[channelId]) fetchAnalyticsForChannel(channelId)
  }

  const StatCard = ({ title, value, colorClass }: { title: string; value: string; colorClass: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )

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
  )

  return (
    <ProtectedLayout title="YouTube Channel Analytics">
      <div className="space-y-6">
        {loading && <ChannelSkeleton />}
        {error && <div className="text-red-600">Error: {error}</div>}

        {!loading && !error && channels && channels.map((channel) => {
          const isOpen = openChannelId === channel.id
          const currentAnalytics = analyticsData[channel.id]
          const isLoadingAnalytics = analyticsLoading[channel.id]

          return (
            <div key={channel.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div
                className="p-4 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleToggleChannel(channel.id)}
              >
                <div className="flex-shrink-0 flex items-center space-x-4 w-full md:w-72">
                  <img src={channel.thumbnailUrl} alt={`${channel.title} thumbnail`} className="w-16 h-16 rounded-full shadow-md" />
                  <h2 className="text-lg font-bold text-gray-800 truncate">{channel.title}</h2>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard title="Subscribers" value={Number(channel.statistics?.subscribers || '0').toLocaleString()} colorClass="text-red-600" />
                  <StatCard title="Total Views" value={Number(channel.statistics?.views || '0').toLocaleString()} colorClass="text-indigo-600" />
                  <StatCard title="Total Videos" value={Number(channel.statistics?.videos || '0').toLocaleString()} colorClass="text-teal-600" />
                </div>
                <div className="w-8 flex justify-center">
                  <svg className={`w-6 h-6 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {isOpen && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  {isLoadingAnalytics && <div className="text-center text-gray-500">Loading analytics...</div>}
                  {!isLoadingAnalytics && currentAnalytics && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance (Last 28 Days)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm text-gray-500">Views</h4>
                          <p className="text-3xl font-bold text-gray-800">{currentAnalytics.views.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm text-gray-500">Net Subscribers</h4>
                          <p className={`text-3xl font-bold ${currentAnalytics.netSubscribers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {currentAnalytics.netSubscribers >= 0 ? '+' : ''}{currentAnalytics.netSubscribers.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ProtectedLayout>
  )
}
