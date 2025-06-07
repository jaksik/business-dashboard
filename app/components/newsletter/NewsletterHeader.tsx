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
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="days" className="text-sm font-medium text-gray-700">
            Last
          </label>
          <select
            id="days"
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {newsletterArticles} newsletter articles • {totalArticles} total articles
        </div>
      </div>
    </div>
  )
}
