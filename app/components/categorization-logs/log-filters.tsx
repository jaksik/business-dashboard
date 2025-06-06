'use client'

import { useState } from 'react'
import { CategorizationLogUiFilters } from './types'; // Import the new UI filter type

// This interface defines the filters managed by this component's UI
// It's separate from the API params to allow for different structures if needed (e.g. date ranges)
export interface LogFiltersComponentState {
  status?: string
  triggeredBy?: string
  // dateFrom?: string // Kept for potential future use, but API uses 'days'
  // dateTo?: string   // Kept for potential future use, but API uses 'days'
  days?: number // For filtering by "last N days"
  search?: string // For client-side search or future API search param
}

interface LogFiltersProps {
  // The current UI filter values
  currentUiFilters: CategorizationLogUiFilters;
  // Callback to notify parent when UI filters change
  onUiFiltersChange: (filters: CategorizationLogUiFilters) => void;
  // Callback to clear all filters
  onClearFilters: () => void;
}

export default function LogFilters({ 
  currentUiFilters, 
  onUiFiltersChange, 
  onClearFilters 
}: LogFiltersProps) {
  // Internal state to manage form inputs, potentially richer than what's passed to API
  const [formState, setFormState] = useState<LogFiltersComponentState>(() => ({
    status: currentUiFilters.status,
    triggeredBy: currentUiFilters.triggeredBy,
    days: currentUiFilters.days,
    search: '', // Search is local to this component for now or could be added to API later
  }));

  const handleInputChange = (key: keyof LogFiltersComponentState, value: string | number) => {
    const newFormState = {
      ...formState,
      [key]: value === '' ? undefined : value,
    };
    setFormState(newFormState);

    // Propagate changes relevant to API filters up to the parent
    if (key === 'status' || key === 'triggeredBy' || key === 'days') {
      onUiFiltersChange({
        status: newFormState.status,
        triggeredBy: newFormState.triggeredBy,
        days: typeof newFormState.days === 'string' ? parseInt(newFormState.days, 10) : newFormState.days,
      });
    }
  };

  const handleClear = () => {
    setFormState({
      status: undefined,
      triggeredBy: undefined,
      days: undefined,
      search: '',
    });
    onClearFilters(); // This will trigger the parent to refetch with default/cleared API params
  };

  const hasActiveFilters = 
    formState.status || 
    formState.triggeredBy || 
    formState.days || 
    formState.search;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search (currently local, can be adapted for API) */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search (Local)
          </label>
          <input
            type="text"
            id="search"
            placeholder="Filter loaded results..."
            value={formState.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formState.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="completed_with_errors">With Errors</option>
            <option value="failed">Failed</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        {/* Triggered By Filter */}
        <div>
          <label htmlFor="triggeredBy" className="block text-sm font-medium text-gray-700 mb-1">
            Triggered By
          </label>
          <select
            id="triggeredBy"
            value={formState.triggeredBy || ''}
            onChange={(e) => handleInputChange('triggeredBy', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Triggers</option>
            <option value="manual">Manual</option>
            <option value="scheduled">Scheduled</option>
            <option value="api">API</option>
          </select>
        </div>

        {/* Days Filter (Last N Days) */}
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
            Last N Days
          </label>
          <input
            type="number"
            id="days"
            placeholder="e.g., 7 for last week"
            value={formState.days === undefined ? '' : formState.days}
            onChange={(e) => handleInputChange('days', e.target.value ? parseInt(e.target.value, 10) : '')}
            min="1"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}