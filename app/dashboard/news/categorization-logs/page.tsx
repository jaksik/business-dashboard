'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedLayout } from "../../../components/auth/protected-layout"

import CategorizationStats from '../../../components/categorization-logs/categorization-stats'
import LogsTable from '../../../components/categorization-logs/logs-table'
import LogFilters from '../../../components/categorization-logs/log-filters'
import {
    CategorizationLog,
    AnalyticsData,
    CategorizationLogApiParams,
    CategorizationLogUiFilters
} from '../../../components/categorization-logs/types'

const API_BASE_URL = '/api/categorization-logs';
const DEFAULT_PAGE_LIMIT = 20;

export default function CategorizationLogsPage() {
    const [logs, setLogs] = useState<CategorizationLog[]>([])
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [uiFilters, setUiFilters] = useState<CategorizationLogUiFilters>({});
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isRunningCategorization, setIsRunningCategorization] = useState(false)
    const [articleCountForRun, setArticleCountForRun] = useState<number>(10); // State for article count input

    const fetchLogs = useCallback(async (page: number, currentUiFilters: CategorizationLogUiFilters) => {
        setLoadingLogs(true)
        try {
            const apiParams: CategorizationLogApiParams = {
                page: page,
                limit: DEFAULT_PAGE_LIMIT,
            };

            if (currentUiFilters.status) apiParams.status = currentUiFilters.status;
            if (currentUiFilters.triggeredBy) apiParams.triggeredBy = currentUiFilters.triggeredBy;
            if (currentUiFilters.days) apiParams.days = currentUiFilters.days;

            // Object.keys(apiParams).forEach(key =>
            //     (apiParams as any)[key] === undefined && delete (apiParams as any)[key]
            // );

            // Create a new object for URLSearchParams to avoid mutating apiParams directly
            // and to ensure all values are strings or numbers.
            const paramsForSearch: Record<string, string | number> = {};
            for (const key in apiParams) {
                if (Object.prototype.hasOwnProperty.call(apiParams, key)) {
                    const value = apiParams[key as keyof CategorizationLogApiParams];
                    if (value !== undefined) {
                        paramsForSearch[key] = value;
                    }
                }
            }

            const params = new URLSearchParams(paramsForSearch as Record<string, string>).toString();
            const response = await fetch(`${API_BASE_URL}?${params}`)
            if (response.ok) {
                const data = await response.json()
                setLogs(data.logs)
                setCurrentPage(data.currentPage)
                setTotalPages(data.totalPages)
            } else {
                console.error('Failed to fetch logs:', response.statusText);
                setLogs([]); // Clear logs on error
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            setLogs([]);
            setTotalPages(1);
        }
        setLoadingLogs(false)
    }, []);

    const fetchAnalytics = useCallback(async () => {
        setLoadingAnalytics(true);
        try {
            const params = new URLSearchParams();
            if (uiFilters.days) params.append('days', uiFilters.days.toString());
            else params.append('days', '30'); // Default to 30 days if not set

            const response = await fetch(`${API_BASE_URL}/analytics?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setAnalytics(data)
            } else {
                console.error('Failed to fetch analytics:', response.statusText);
                setAnalytics(null);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
            setAnalytics(null);
        }
        setLoadingAnalytics(false);
    }, [uiFilters.days]);

    const runCategorization = async () => {
        if (isRunningCategorization) return

        // const articleCountInput = prompt('How many articles would you like to categorize?', '10')
        // if (!articleCountInput) return; // User cancelled

        // const articleCount = parseInt(articleCountInput, 10);
        if (isNaN(articleCountForRun) || articleCountForRun <= 0) {
            alert('Please enter a valid number of articles.');
            return;
        }

        setIsRunningCategorization(true)
        try {
            const response = await fetch('/api/jobs/categorize-articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleCount: articleCountForRun, // Use state variable here
                    triggeredBy: 'manual'
                }),
            })

            if (response.ok) {
                alert('Categorization job started successfully! Logs will update shortly.');
                await fetchLogs(1, uiFilters); // Fetch first page with current filters
                await fetchAnalytics();
            } else {
                const errorData = await response.json();
                alert(`Categorization failed: ${errorData.message || response.statusText}`)
            }
        } catch (error) {
            console.error('Failed to run categorization:', error)
            alert('Failed to run categorization. Please try again.')
        }
        setIsRunningCategorization(false)
    }

    useEffect(() => {
        fetchLogs(currentPage, uiFilters);
    }, [uiFilters, currentPage, fetchLogs]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleUiFiltersChange = (newUiFilters: CategorizationLogUiFilters) => {
        setUiFilters(newUiFilters);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setUiFilters({});
        setCurrentPage  (1);
    };

    return (
        <ProtectedLayout title="AI-powered Categorization Logs">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">

                    {/* Action items: Input and Button */}
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={articleCountForRun}
                            onChange={(e) => setArticleCountForRun(parseInt(e.target.value, 10) || 0)}
                            min="1"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-24"
                            placeholder="Count"
                            disabled={isRunningCategorization}
                        />
                        <button
                            onClick={runCategorization}
                            disabled={isRunningCategorization || articleCountForRun <= 0}
                            className={`px-4 py-2 rounded-md font-medium transition-colors duration-150 ease-in-out ${
                                isRunningCategorization || articleCountForRun <= 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                                }`}
                        >
                            {isRunningCategorization ? 'Processing...' : 'Run New Categorization'}
                        </button>
                    </div>
                </div>

                {/* Analytics Stats */}
                {loadingAnalytics && <div className="text-center p-4">Loading analytics...</div>}
                {!loadingAnalytics && analytics && <CategorizationStats analytics={analytics} />}
                {!loadingAnalytics && !analytics && <div className="text-center p-4 text-gray-500">Analytics data could not be loaded.</div>}

                {/* Filters */}
                <LogFilters
                    currentUiFilters={uiFilters}
                    onUiFiltersChange={handleUiFiltersChange}
                    onClearFilters={handleClearFilters}
                />

                {/* Logs Table */}
                <LogsTable logs={logs} loading={loadingLogs} />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loadingLogs}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <span className="px-3 py-2 text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loadingLogs}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
                {logs.length === 0 && !loadingLogs && (
                    <div className="text-center p-4 text-gray-500">No logs found for the selected filters.</div>
                )}
            </div>
        </ProtectedLayout>

    )
}