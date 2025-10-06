'use client'

import { ProtectedLayout } from "../components/auth/protected-layout"

export default function Dashboard() {
  return (
    <ProtectedLayout title="Dashboard Overview">
      <div className="space-y-6">

        {/* User-specific Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$12,450</p>
            <p className="text-sm text-gray-500">Personal goal: 85% complete</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Clients</h3>
            <p className="text-3xl font-bold text-blue-600">23</p>
            <p className="text-sm text-gray-500">2 new this week</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks Completed</h3>
            <p className="text-3xl font-bold text-purple-600">18/25</p>
            <p className="text-sm text-gray-500">7 remaining today</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Time Tracked</h3>
            <p className="text-3xl font-bold text-orange-600">32h</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
        </div> */}

        {/* Personal Activity Feed */}
        {/* <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Your Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Completed project proposal for Client XYZ</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Added new client: ABC Corporation</p>
                  <p className="text-sm text-gray-500">Yesterday</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Generated monthly report</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Quick Stats Grid */}
      {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Budget</h3>
          <p className="text-2xl font-bold text-green-600">$3,200</p>
          <p className="text-xs text-gray-500">$800 remaining</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Workouts This Week</h3>
          <p className="text-2xl font-bold text-blue-600">4/5</p>
          <p className="text-xs text-gray-500">Goal: 5 per week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Side Project Progress</h3>
          <p className="text-2xl font-bold text-purple-600">65%</p>
          <p className="text-xs text-gray-500">Launch in 2 weeks</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Books Read</h3>
          <p className="text-2xl font-bold text-orange-600">3/12</p>
          <p className="text-xs text-gray-500">2024 goal</p>
        </div>
      </div> */}

      {/* Recent Activity */}
      {/* <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed morning workout - 7:30 AM</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Updated monthly budget - Yesterday</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Finished chapter 3 of &ldquo;Atomic Habits&rdquo; - 2 days ago</span>
            </div>
          </div>
        </div> */}
      </div>
    </ProtectedLayout>
  )
}