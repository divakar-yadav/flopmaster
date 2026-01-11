import { useState } from 'react'
import MatrixFlopsCalculator from './components/MatrixFlopsCalculator'
import DistributedOperations from './components/DistributedOperations'
import ParallelismTypes from './components/ParallelismTypes'

type Tab = 'calculator' | 'distributed' | 'parallelism'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            FLOPs Master
          </h1>
          <p className="text-xl text-gray-600">
            Matrix Multiplication FLOPs Calculator & Distributed Computing Guide
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`
                px-6 py-3 rounded-md font-medium transition-all duration-200
                ${
                  activeTab === 'calculator'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              FLOPs Calculator
            </button>
            <button
              onClick={() => setActiveTab('distributed')}
              className={`
                px-6 py-3 rounded-md font-medium transition-all duration-200
                ${
                  activeTab === 'distributed'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              Distributed Operations
            </button>
            <button
              onClick={() => setActiveTab('parallelism')}
              className={`
                px-6 py-3 rounded-md font-medium transition-all duration-200
                ${
                  activeTab === 'parallelism'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              Parallelism Types
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' ? (
          <MatrixFlopsCalculator />
        ) : activeTab === 'distributed' ? (
          <DistributedOperations />
        ) : (
          <ParallelismTypes />
        )}
      </div>
    </div>
  )
}

export default App

