'use client'

import { ProtectedLayout } from "../components/auth/protected-layout"

export default function Dashboard() {
  return (
    <ProtectedLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* Personalized Welcome Message */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, User!
          </h2>
          <p className="opacity-90">
            Here&apos;s your personalized business overview for today.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/control-panel"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📡</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Control Panel</h3>
                <p className="text-xs text-gray-600">Manage article sources and fetch operations</p>
              </div>
            </a>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Analytics</h3>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚙️</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Settings</h3>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Site Navigation Map */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Site Navigation</h2>
            <p className="text-sm text-gray-600">All available pages and features in the application</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Main Dashboard */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  🏠 Dashboard
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
                      Dashboard Overview
                    </a>
                  </li>
                </ul>
              </div>

              {/* Article System */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  📰 Article System
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/dashboard/control-panel" className="text-blue-600 hover:text-blue-800 text-sm">
                      Control Panel
                    </a>
                    <p className="text-xs text-gray-500 ml-2">Manage sources & fetch operations</p>
                  </li>
                  <li>
                    <a href="/dashboard/news/articles" className="text-blue-600 hover:text-blue-800 text-sm">
                      Articles View
                    </a>
                    <p className="text-xs text-gray-500 ml-2">Browse fetched articles</p>
                  </li>
                  <li>
                    <a href="/dashboard/news/sources" className="text-blue-600 hover:text-blue-800 text-sm">
                      Sources Management
                    </a>
                    <p className="text-xs text-gray-500 ml-2">Add & configure RSS sources</p>
                  </li>
                </ul>
              </div>

              {/* API Endpoints */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  🔌 API Endpoints
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="text-green-600 text-xs font-mono">GET</span>
                    <span className="text-gray-700 text-sm ml-2">/api/sources</span>
                  </li>
                  <li>
                    <span className="text-blue-600 text-xs font-mono">POST</span>
                    <span className="text-gray-700 text-sm ml-2">/api/jobs/article-fetch/bulk</span>
                  </li>
                  <li>
                    <span className="text-blue-600 text-xs font-mono">POST</span>
                    <span className="text-gray-700 text-sm ml-2">/api/jobs/article-fetch/single</span>
                  </li>
                  <li>
                    <span className="text-green-600 text-xs font-mono">GET</span>
                    <span className="text-gray-700 text-sm ml-2">/api/jobs/article-fetch/logs</span>
                  </li>
                </ul>
              </div>

              {/* Authentication */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  🔐 Authentication
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/auth/signin" className="text-blue-600 hover:text-blue-800 text-sm">
                      Sign In
                    </a>
                  </li>
                  <li>
                    <a href="/auth/error" className="text-blue-600 hover:text-blue-800 text-sm">
                      Auth Error Page
                    </a>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm">Sign Out (via auth button)</span>
                  </li>
                </ul>
              </div>

              {/* Development Tools */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  🛠️ Development
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="text-gray-500 text-sm">RSS Test Panel</span>
                    <p className="text-xs text-gray-500 ml-2">(Component available)</p>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm">Article Components</span>
                    <p className="text-xs text-gray-500 ml-2">(Ready for implementation)</p>
                  </li>
                </ul>
              </div>

              {/* Features Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  📊 Feature Status
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-700">Article Fetching</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-700">Source Management</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-700">Fetch Logging</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-700">Article Categorization</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-500">Analytics Dashboard</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* User-specific Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Personal Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border">
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
      </div>

      {/* Quick Stats Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
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
        </div>
      </div>
    </ProtectedLayout>
  )
}