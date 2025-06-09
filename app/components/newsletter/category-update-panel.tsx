import type { PendingChanges, PendingChange } from './types'

interface PendingChangesPanelProps {
  pendingChanges: PendingChanges
  onSubmit: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function PendingChangesPanel({ 
  pendingChanges, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: PendingChangesPanelProps) {
  const pendingChangesCount = Object.keys(pendingChanges).length
  const hasIncompleteChanges = Object.values(pendingChanges).some((change: PendingChange) => !change.rationale.trim())

  if (pendingChangesCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            ⏳ {pendingChangesCount} pending change{pendingChangesCount > 1 ? 's' : ''}
          </span>
          {hasIncompleteChanges && (
            <span className="text-sm text-red-600">
              ⚠️ Missing rationale for some changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            Cancel All
          </button>
          <button
            onClick={onSubmit}
            disabled={hasIncompleteChanges || isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              'Submit All Changes'
            )}
          </button>
        </div>
      </div>
      {hasIncompleteChanges && (
        <div className="mt-3 text-sm text-blue-700">
          Please provide rationale for all changes before submitting.
        </div>
      )}
    </div>
  )
}
