import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface AttemptLimitMessageProps {
  isLimitExceeded: boolean
  currentAttempts: number
  maxAttempts: number
}

export default function AttemptLimitMessage({
  isLimitExceeded,
  currentAttempts,
  maxAttempts
}: AttemptLimitMessageProps) {
  if (isLimitExceeded) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-gray-500 mr-2" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              시도 횟수 초과
            </p>
            <p className="text-xs text-gray-600 mt-1">
              잠시 후 다시 시도해주세요
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      <p className="text-xs text-gray-500">
        남은 시도:
      </p>
      <div className="flex space-x-1">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentAttempts
                ? 'bg-red-400'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        ({maxAttempts - currentAttempts}회)
      </p>
    </div>
  )
}