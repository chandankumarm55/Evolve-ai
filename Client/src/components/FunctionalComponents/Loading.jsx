import React from 'react'

const Loading = () => {
    return (
        <div className='w-full h-screen bg-transparent flex items-center justify-center'>
            <div className="relative flex flex-col items-center">
                {/* Main loading animation */ }
                <div className="relative">
                    {/* Outer rotating ring */ }
                    <div className="w-20 h-20 border-4 border-gray-300/30 rounded-full animate-spin">
                        <div className="w-full h-full border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-pulse"></div>
                    </div>

                    {/* Inner pulsing core */ }
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-80"></div>
                    </div>

                    {/* AI Brain dots */ }
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-6 h-6">
                            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={ { animationDelay: '0s' } }></div>
                            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={ { animationDelay: '0.2s' } }></div>
                            <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={ { animationDelay: '0.4s' } }></div>
                            <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={ { animationDelay: '0.6s' } }></div>
                        </div>
                    </div>
                </div>

                {/* Text with typing animation */ }
                <div className="mt-6 text-center">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Evolve AI
                    </h2>
                    <div className="flex items-center space-x-1">
                        <span className="text-gray-600 text-sm">Loading</span>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={ { animationDelay: '0s' } }></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={ { animationDelay: '0.1s' } }></div>
                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={ { animationDelay: '0.2s' } }></div>
                        </div>
                    </div>
                </div>

                {/* Subtle neural network lines */ }
                <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-32 h-32 opacity-20" viewBox="0 0 128 128">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M32 64 L96 32 M32 64 L96 96 M64 32 L64 96"
                            stroke="url(#lineGradient)"
                            strokeWidth="1"
                            fill="none"
                            className="animate-pulse"
                        />
                        <circle cx="32" cy="64" r="2" fill="#3B82F6" className="animate-pulse" />
                        <circle cx="96" cy="32" r="2" fill="#8B5CF6" className="animate-pulse" />
                        <circle cx="96" cy="96" r="2" fill="#6366F1" className="animate-pulse" />
                        <circle cx="64" cy="32" r="2" fill="#8B5CF6" className="animate-pulse" />
                        <circle cx="64" cy="96" r="2" fill="#3B82F6" className="animate-pulse" />
                    </svg>
                </div>
            </div>

            <style jsx>{ `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    )
}

export default Loading