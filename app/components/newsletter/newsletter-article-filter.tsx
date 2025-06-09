interface NewsletterHeaderProps {
  days: number
  onDaysChange: (days: number) => void
  newsletterArticles: number
  totalArticles: number
}

export function NewsletterHeader({ 
  days, 
  onDaysChange, 
  newsletterArticles, 
  totalArticles 
}: NewsletterHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Newsletter Article Filter
            </h1>
            <div className="text-sm text-gray-600">
              {newsletterArticles} newsletter articles • {totalArticles} total articles
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="days" className="text-sm font-medium text-gray-700">
              Last
            </label>
            <select
              id="days"
              value={days}
              onChange={(e) => onDaysChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
