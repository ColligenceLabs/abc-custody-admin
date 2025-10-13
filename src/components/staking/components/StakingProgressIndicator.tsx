"use client";

interface StakingProgressIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function StakingProgressIndicator({
  currentStep,
}: StakingProgressIndicatorProps) {
  const steps = [
    { number: 1, label: "자산" },
    { number: 2, label: "수량" },
    { number: 3, label: "검증인" },
    { number: 4, label: "확인" },
  ];

  return (
    <div className="flex items-center justify-center space-x-8 py-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                step.number < currentStep
                  ? "bg-sky-600 text-white"
                  : step.number === currentStep
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.number < currentStep ? "✓" : step.number}
            </div>
            <span
              className={`text-xs mt-1 ${
                step.number <= currentStep
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-2 ${
                step.number < currentStep ? "bg-sky-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
