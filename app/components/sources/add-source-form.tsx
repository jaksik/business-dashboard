'use client'

import { useState } from 'react'
import { SourceFormData, TestConnectionResult } from './types'

interface AddSourceFormProps {
  onSourceAdded: () => void
}

export function AddSourceForm({ onSourceAdded }: AddSourceFormProps) {
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    url: '',
    type: 'rss',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormVisible, setIsFormVisible] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Source name is required'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTestConnection = async () => {
    if (!formData.url.trim()) {
      setErrors({ url: 'Please enter a URL to test' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: formData.url,
          type: formData.type 
        })
      })

      const result = await response.json()
      setTestResult(result)

      // Auto-populate name if successful and name is empty
      if (result.success && !formData.name.trim() && result.details?.title) {
        setFormData(prev => ({ ...prev, name: result.details.title }))
      }

    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          url: '',
          type: 'rss',
          isActive: true
        })
        setTestResult(null)
        setErrors({})
        onSourceAdded()
        // Collapse form after successful submission
        setIsFormVisible(false)
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || 'Failed to add source' })
      }
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to add source' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof SourceFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Clear test result when URL changes
    if (field === 'url') {
      setTestResult(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add New Source</h2>
          <span className="text-sm text-gray-500">Add RSS feeds or websites to monitor</span>
        </div>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={isFormVisible ? "Hide form" : "Show form"}
        >
          <span>{isFormVisible ? "Hide" : "Show"}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isFormVisible ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Source Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., TechCrunch, BBC News"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Source Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Source Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as 'rss' | 'html')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="rss">RSS Feed</option>
              <option value="html">HTML Website</option>
            </select>
          </div>
        </div>

        {/* URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <div className="flex gap-2">
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com/feed.xml"
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.url ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.url.trim()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg border border-gray-300 flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Testing...
                </>
              ) : (
                '🔍 Test'
              )}
            </button>
          </div>
          {errors.url && (
            <p className="text-red-600 text-xs mt-1">{errors.url}</p>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
              </span>
            </div>
            <p className={`text-sm ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </p>
            {testResult.details && (
              <div className="text-xs text-green-600 mt-1 space-y-1">
                {testResult.details.title && (
                  <p><strong>Title:</strong> {testResult.details.title}</p>
                )}
                {testResult.details.itemCount && (
                  <p><strong>Items:</strong> {testResult.details.itemCount}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active (start fetching articles immediately)
          </label>
        </div>

        {/* Submit Errors */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding Source...
              </>
            ) : (
              <>
                ➕ Add Source
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  )
}
