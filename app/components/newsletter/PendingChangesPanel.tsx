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
    <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-yellow-800">
          ⏳ Pending Changes ({pendingChangesCount})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel All
          </button>
          <button
            onClick={onSubmit}
            disabled={hasIncompleteChanges || isSubmitting}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit All Changes'}
          </button>
        </div>
      </div>
      <div className="text-sm text-yellow-700 mb-2">
        Please provide rationale for all changes before submitting.
      </div>
      {hasIncompleteChanges && (
        <div className="text-sm text-red-600">
          ⚠️ Some changes are missing rationale and cannot be submitted.
        </div>
      )}
    </div>
  )
}
