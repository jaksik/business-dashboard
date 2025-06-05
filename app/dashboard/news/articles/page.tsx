'use client'

import { ProtectedLayout } from "../../../components/auth/protected-layout"

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
            </div>
        </ProtectedLayout>
    )
}