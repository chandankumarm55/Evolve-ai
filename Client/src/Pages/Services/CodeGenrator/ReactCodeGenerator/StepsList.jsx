import React from 'react';
function StepsList({ steps, currentStep, onStepClick }) {
    return (
        <div className="space-y-2">
            { steps.map((step, index) => (
                <div
                    key={ `step-${step.id || index}` }  // Use unique key
                    onClick={ () => onStepClick(index + 1) }
                    className={ `
            cursor-pointer p-3 rounded-lg transition-all duration-200
            ${currentStep === index + 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          `}
                >
                    <div className="flex items-center">
                        <span className="mr-3 font-bold">{ index + 1 }.</span>
                        <span>{ step.description || 'Unnamed Step' }</span>
                    </div>
                    <div className="text-sm mt-1 opacity-70">
                        { step.status === 'pending'
                            ? 'Pending'
                            : step.status === 'completed'
                                ? 'Completed'
                                : 'Not Started' }
                    </div>
                </div>
            )) }
        </div>
    );
}

export default StepsList;