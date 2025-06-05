'use client'

import { ProtectedLayout } from "../components/auth/protected-layout"

export default function Finances() {
  return (
    <ProtectedLayout title="Personal Finances">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Monthly Budget</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Income</span>
              <span className="font-semibold text-green-600">$4,000</span>
            </div>
            <div className="flex justify-between">
              <span>Rent</span>
              <span>$1,200</span>
            </div>
            <div className="flex justify-between">
              <span>Food</span>
              <span>$400</span>
            </div>
            <div className="flex justify-between">
              <span>Utilities</span>
              <span>$200</span>
            </div>
            <div className="flex justify-between">
              <span>Transportation</span>
              <span>$150</span>
            </div>
            <div className="flex justify-between">
              <span>Entertainment</span>
              <span>$200</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Remaining</span>
              <span className="text-green-600">$1,850</span>
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Savings Goals</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Emergency Fund</span>
                <span className="text-sm">$8,500 / $10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Vacation Fund</span>
                <span className="text-sm">$1,200 / $3,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">New Car Fund</span>
                <span className="text-sm">$3,400 / $15,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '23%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Groceries - Whole Foods</p>
                <p className="text-sm text-gray-500">June 4, 2025</p>
              </div>
              <span className="text-red-600">-$85.32</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Salary Deposit</p>
                <p className="text-sm text-gray-500">June 1, 2025</p>
              </div>
              <span className="text-green-600">+$4,000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Netflix Subscription</p>
                <p className="text-sm text-gray-500">May 30, 2025</p>
              </div>
              <span className="text-red-600">-$15.99</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Gas Station</p>
                <p className="text-sm text-gray-500">May 28, 2025</p>
              </div>
              <span className="text-red-600">-$45.20</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
