import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DistributedOperations.css'
import NVLinkConnections from './NVLinkConnections'

interface Operation {
  name: string
  description: string
  useCase: string
  visualization: 'all-reduce' | 'all-gather' | 'gather' | 'scatter' | 'broadcast' | 'reduce'
}

const operations: Operation[] = [
  {
    name: 'All-Reduce',
    description: 'Combines data from all processes using a reduction operation (sum, max, min, etc.) and distributes the result back to all processes.',
    useCase: 'Used in gradient synchronization during distributed training, where gradients from all GPUs are summed and distributed back.',
    visualization: 'all-reduce',
  },
  {
    name: 'All-Gather',
    description: 'Each process sends its data to all other processes, resulting in all processes having a concatenated copy of all data.',
    useCase: 'Useful when all processes need access to data from all other processes, such as collecting embeddings from all GPUs.',
    visualization: 'all-gather',
  },
  {
    name: 'Gather',
    description: 'All processes send their data to a root process, which collects all the data. Only the root process receives the complete data.',
    useCase: 'Used when only one process (typically rank 0) needs to collect results from all other processes for logging or checkpointing.',
    visualization: 'gather',
  },
  {
    name: 'Scatter',
    description: 'Root process distributes different chunks of data to each process. Each process receives a unique portion of the data.',
    useCase: 'Common in data parallelism where the root process splits a dataset and distributes chunks to different GPUs.',
    visualization: 'scatter',
  },
  {
    name: 'Broadcast',
    description: 'Root process sends the same data to all other processes. All processes end up with identical copies of the data.',
    useCase: 'Used to distribute model weights, hyperparameters, or initial data to all processes at the start of training.',
    visualization: 'broadcast',
  },
  {
    name: 'Reduce',
    description: 'All processes send their data to a root process, which applies a reduction operation (sum, max, min, etc.). Only root receives the result.',
    useCase: 'Similar to gather but with a reduction operation applied. Used when only the root needs the aggregated result.',
    visualization: 'reduce',
  },
]

// Example matrices for demonstration
const exampleMatrices = {
  A: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  B: [[9, 8, 7], [6, 5, 4], [3, 2, 1]],
  C: [[2, 3, 4], [5, 6, 7], [8, 9, 10]],
  D: [[1, 1, 1], [2, 2, 2], [3, 3, 3]],
}

export default function DistributedOperations() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>(operations[0])
  const [animationKey, setAnimationKey] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedCells, setCompletedCells] = useState<Set<string>>(new Set())
  const [showExplanation, setShowExplanation] = useState(true)

  const handleOperationSelect = (operation: Operation) => {
    setSelectedOperation(operation)
    setAnimationKey((prev) => prev + 1)
    setCurrentStep(0)
    setIsPlaying(false)
    setCompletedCells(new Set())
    setShowExplanation(true)
  }

  const startAnimation = () => {
    setCurrentStep(0)
    setIsPlaying(true)
    setCompletedCells(new Set())
    setShowExplanation(false)
  }

  const resetAnimation = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setCompletedCells(new Set())
    setShowExplanation(true)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
    setIsPlaying(true)
    setShowExplanation(false)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setIsPlaying(true)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Distributed GPU Operations
          </h2>
          <p className="text-gray-600">
            Learn about collective communication operations used in distributed deep learning
          </p>
        </div>

        {/* Operation Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {operations.map((op) => (
            <button
              key={op.name}
              onClick={() => handleOperationSelect(op)}
              className={`
                px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${
                  selectedOperation.name === op.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-sm font-medium">{op.name}</div>
            </button>
          ))}
        </div>

          {/* Operation Details */}
          <div className="border-t pt-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedOperation.name}
              </h3>
              <p className="text-gray-700 mb-4">{selectedOperation.description}</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Use Case:</span> {selectedOperation.useCase}
                </p>
              </div>
              
              {/* Matrix Multiplication Example */}
              <OperationExample operation={selectedOperation.visualization} />
            </div>

          {/* Step-by-Step Navigation */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Step-by-Step Visualization</h4>
                <p className="text-sm text-gray-600">
                  Watch how data flows between GPUs in {selectedOperation.name.toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {!isPlaying ? (
                  <button
                    onClick={startAnimation}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Auto Play
                  </button>
                ) : (
                  <button
                    onClick={resetAnimation}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 50) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">Step {currentStep}</span>
            </div>
          </div>

          {/* Step Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h5 className="font-semibold text-amber-800 mb-1">Getting Started</h5>
                  <p className="text-sm text-amber-700">
                    Click "Next" to step through the operation, or "Auto Play" to watch the full animation. 
                    Watch how matrix values move between GPUs in real-time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Visualization Container */}
          <div className="visualization-container bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 rounded-xl p-8 min-h-[500px] relative overflow-hidden border border-gray-200">
            <OperationVisualization
              key={animationKey}
              operation={selectedOperation.visualization}
              isPlaying={isPlaying}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              completedCells={completedCells}
              setCompletedCells={setCompletedCells}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface OperationVisualizationProps {
  operation: string
  isPlaying: boolean
  currentStep: number
  setCurrentStep: (step: number) => void
  completedCells: Set<string>
  setCompletedCells: (cells: Set<string> | ((prev: Set<string>) => Set<string>)) => void
}

function OperationVisualization({
  operation,
  isPlaying,
  currentStep,
  setCurrentStep,
  completedCells,
  setCompletedCells,
}: OperationVisualizationProps) {
  const numProcesses = 4
  const matrixSize = 3

  // Generate example matrices for each process
  const generateMatrix = (processId: number) => {
    const matrix: number[][] = []
    for (let i = 0; i < matrixSize; i++) {
      const row: number[] = []
      for (let j = 0; j < matrixSize; j++) {
        row.push(processId * 10 + i * matrixSize + j + 1)
      }
      matrix.push(row)
    }
    return matrix
  }

  const processes = Array.from({ length: numProcesses }, (_, i) => ({
    id: i,
    matrix: generateMatrix(i),
  }))

  switch (operation) {
    case 'all-reduce':
      return (
        <AllReduceVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    case 'all-gather':
      return (
        <AllGatherVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    case 'gather':
      return (
        <GatherVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    case 'scatter':
      return (
        <ScatterVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    case 'broadcast':
      return (
        <BroadcastVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    case 'reduce':
      return (
        <ReduceVisualization
          processes={processes}
          isPlaying={isPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedCells={completedCells}
          setCompletedCells={setCompletedCells}
        />
      )
    default:
      return <div>Unknown operation</div>
  }
}

interface Process {
  id: number
  matrix: number[][]
}

interface VisualizationProps {
  processes: Process[]
  isPlaying: boolean
  currentStep: number
  setCurrentStep: (step: number) => void
  completedCells: Set<string>
  setCompletedCells: (cells: Set<string> | ((prev: Set<string>) => Set<string>)) => void
}

function AllReduceVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  // Calculate result (sum of all matrices)
  const resultMatrix = processes[0].matrix.map((row, i) =>
    row.map((_, j) =>
      processes.reduce((sum, p) => sum + p.matrix[i][j], 0)
    )
  )

  const totalCells = processes.length * 9 // 4 processes * 9 cells each
  const cellsPerStep = 3 // Process 3 cells at a time

  useEffect(() => {
    if (!isPlaying) return

    const maxSteps = Math.ceil(totalCells / cellsPerStep) * 2 // Send + receive
    if (currentStep < maxSteps) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 800) // Slow step-by-step: 800ms per step
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalCells, cellsPerStep, setCurrentStep])

  // Calculate which cells should be animated
  const getCellState = (_processId: number, _row: number, _col: number, _phase: 'send' | 'receive') => {
    return { isActive: false, isCompleted: false }
  }

  return (
    <div className="distributed-viz">
      {/* NVLink Connections */}
      <NVLinkConnections
        processes={processes}
        operation="all-reduce"
        isPlaying={isPlaying}
        currentStep={currentStep}
      />

      {/* Source GPUs */}
      <div className="processes-container">
        {processes.map((process) => (
          <div key={process.id} className="process-card" data-position="top-left">
            <div className="process-label">GPU {process.id}</div>
            <MatrixDisplay
              matrix={process.matrix}
              processId={process.id}
              getCellState={(row, col) => getCellState(process.id, row, col, 'send')}
              isPlaying={isPlaying}
            />
          </div>
        ))}
      </div>

      {/* Reduction Center */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="reduction-center"
      >
        <div className="operation-label">SUM</div>
        <MatrixDisplay
          matrix={resultMatrix}
          highlight
          processId="center"
          getCellState={(_row, _col) => {
            const isActive = currentStep >= totalCells && isPlaying
            return { isActive, isCompleted: isActive }
          }}
          isPlaying={isPlaying}
        />
      </motion.div>

      {/* Destination GPUs */}
      <div className="processes-container">
        {processes.map((process) => (
          <div key={process.id} className="process-card" data-position="bottom">
            <MatrixDisplay
              matrix={resultMatrix}
              processId={process.id}
              getCellState={(row, col) => getCellState(process.id, row, col, 'receive')}
              isPlaying={isPlaying}
            />
            <div className="process-label">GPU {process.id}</div>
          </div>
        ))}
      </div>

      {/* Animated cells */}
      {isPlaying && (
        <AnimatedCellFlow
          processes={processes}
          resultMatrix={resultMatrix}
          currentStep={currentStep}
          totalCells={totalCells}
          direction="all-reduce"
        />
      )}
    </div>
  )
}

function AllGatherVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  const totalSteps = processes.length * processes.length * 9

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalSteps, setCurrentStep])

  return (
    <div className="distributed-viz">
      <div className="processes-container">
        {processes.map((process) => (
          <div key={process.id} className="process-card">
            <div className="process-label">GPU {process.id}</div>
            <MatrixDisplay matrix={process.matrix} processId={process.id} />
          </div>
        ))}
      </div>

      <div className="processes-container mt-8">
        {processes.map((targetProcess) => (
          <div key={targetProcess.id} className="process-card">
            <div className="process-label">GPU {targetProcess.id}</div>
            <div className="concatenated-matrix">
              {processes.map((sourceProcess, sourceIdx) => (
                <motion.div
                  key={sourceProcess.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isPlaying && currentStep >= (targetProcess.id * processes.length + sourceIdx) * 9 ? 1 : 0,
                    scale: isPlaying && currentStep >= (targetProcess.id * processes.length + sourceIdx) * 9 ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.5 }}
                  className="matrix-chunk"
                >
                  <MatrixDisplay matrix={sourceProcess.matrix} processId={targetProcess.id} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GatherVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  const totalCells = processes.length * 9

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalCells) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalCells, setCurrentStep])

  return (
    <div className="distributed-viz">
      <div className="processes-container">
        {processes.map((process) => (
          <div key={process.id} className="process-card">
            <div className="process-label">GPU {process.id}</div>
            <MatrixDisplay matrix={process.matrix} processId={process.id} />
          </div>
        ))}
      </div>

      <motion.div className="root-process">
        <div className="process-label">GPU 0 (Root)</div>
        <div className="concatenated-matrix">
          {processes.map((process, idx) => (
            <motion.div
              key={process.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isPlaying && currentStep >= idx * 9 ? 1 : 0,
                scale: isPlaying && currentStep >= idx * 9 ? 1 : 0.8,
              }}
              transition={{ duration: 0.5 }}
              className="matrix-chunk"
            >
              <MatrixDisplay matrix={process.matrix} processId={0} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {isPlaying && (
        <AnimatedCellFlow
          processes={processes}
          resultMatrix={null}
          currentStep={currentStep}
          totalCells={totalCells}
          direction="gather"
        />
      )}
    </div>
  )
}

function ScatterVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  const totalCells = processes.length * 9

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalCells) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalCells, setCurrentStep])

  return (
    <div className="distributed-viz">
      {/* NVLink Connections */}
      <NVLinkConnections
        processes={processes}
        operation="scatter"
        isPlaying={isPlaying}
        currentStep={currentStep}
      />

      <div className="root-process">
        <div className="process-label">GPU 0 (Root)</div>
        <div className="concatenated-matrix">
          {processes.map((p) => (
            <div key={p.id} className="matrix-chunk">
              <MatrixDisplay matrix={p.matrix} processId={0} />
            </div>
          ))}
        </div>
      </div>

      <div className="processes-container mt-8">
        {processes.map((process, idx) => (
          <div key={process.id} className="process-card" data-position="bottom">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: isPlaying && currentStep >= idx * 9 ? 1 : 0,
                scale: isPlaying && currentStep >= idx * 9 ? 1 : 0.5,
              }}
              transition={{ duration: 0.6 }}
            >
              <MatrixDisplay matrix={process.matrix} processId={process.id} />
            </motion.div>
            <div className="process-label">GPU {process.id}</div>
          </div>
        ))}
      </div>

      {isPlaying && (
        <AnimatedCellFlow
          processes={processes}
          resultMatrix={null}
          currentStep={currentStep}
          totalCells={totalCells}
          direction="scatter"
        />
      )}
    </div>
  )
}

function BroadcastVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  const rootMatrix = processes[0].matrix
  const totalCells = (processes.length - 1) * 9

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalCells) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalCells, setCurrentStep])

  return (
    <div className="distributed-viz">
      {/* NVLink Connections */}
      <NVLinkConnections
        processes={processes}
        operation="broadcast"
        isPlaying={isPlaying}
        currentStep={currentStep}
      />

      <motion.div
        animate={{
          scale: isPlaying ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          repeatType: 'reverse',
        }}
        className="root-process"
      >
        <div className="process-label">GPU 0 (Root)</div>
        <MatrixDisplay matrix={rootMatrix} highlight processId={0} />
      </motion.div>

      <div className="processes-container mt-8">
        {processes.slice(1).map((process, idx) => (
          <div key={process.id} className="process-card" data-position="bottom">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: isPlaying && currentStep >= idx * 9 ? 1 : 0,
                scale: isPlaying && currentStep >= idx * 9 ? 1 : 0.5,
              }}
              transition={{ duration: 0.6 }}
            >
              <MatrixDisplay matrix={rootMatrix} processId={process.id} />
            </motion.div>
            <div className="process-label">GPU {process.id}</div>
          </div>
        ))}
      </div>

      {isPlaying && (
        <AnimatedCellFlow
          processes={processes}
          resultMatrix={rootMatrix}
          currentStep={currentStep}
          totalCells={totalCells}
          direction="broadcast"
        />
      )}
    </div>
  )
}

function ReduceVisualization({
  processes,
  isPlaying,
  currentStep,
  setCurrentStep,
}: VisualizationProps) {
  const resultMatrix = processes[0].matrix.map((row, i) =>
    row.map((_, j) =>
      processes.reduce((sum, p) => sum + p.matrix[i][j], 0)
    )
  )

  const totalCells = processes.length * 9

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalCells) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalCells, setCurrentStep])

  return (
    <div className="distributed-viz">
      <div className="processes-container">
        {processes.map((process) => (
          <div key={process.id} className="process-card">
            <div className="process-label">GPU {process.id}</div>
            <MatrixDisplay matrix={process.matrix} processId={process.id} />
          </div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="root-process"
      >
        <div className="process-label">GPU 0 (Root)</div>
        <div className="operation-label">SUM</div>
        <MatrixDisplay
          matrix={resultMatrix}
          highlight
          processId={0}
          getCellState={(row, col) => {
            const cellIndex = row * 3 + col
            const isActive = isPlaying && currentStep >= totalCells - 9 + cellIndex
            return { isActive, isCompleted: isActive }
          }}
          isPlaying={isPlaying}
        />
      </motion.div>

      {isPlaying && (
        <AnimatedCellFlow
          processes={processes}
          resultMatrix={resultMatrix}
          currentStep={currentStep}
          totalCells={totalCells}
          direction="reduce"
        />
      )}
    </div>
  )
}

interface MatrixDisplayProps {
  matrix: number[][]
  highlight?: boolean
  processId: number | string
  getCellState?: (row: number, col: number) => { isActive: boolean; isCompleted: boolean }
  isPlaying?: boolean
}

// Component to show matrix multiplication examples
function OperationExample({ operation }: { operation: string }) {
  const getExample = () => {
    switch (operation) {
      case 'all-reduce':
        return {
          title: 'Example: Gradient Synchronization in Distributed Training',
          description: 'Each GPU computes gradients for a batch. All-Reduce sums all gradients and distributes the result.',
          matrices: {
            'GPU 0 (∇L₀)': exampleMatrices.A,
            'GPU 1 (∇L₁)': exampleMatrices.B,
            'GPU 2 (∇L₂)': exampleMatrices.C,
            'GPU 3 (∇L₃)': exampleMatrices.D,
          },
          operation: 'SUM',
          result: exampleMatrices.A.map((row, i) =>
            row.map((_, j) =>
              exampleMatrices.A[i][j] + exampleMatrices.B[i][j] + exampleMatrices.C[i][j] + exampleMatrices.D[i][j]
            )
          ),
          formula: 'Σ(∇L₀ + ∇L₁ + ∇L₂ + ∇L₃) → All GPUs',
          flowDiagram: {
            steps: [
              { from: 'GPU 0', to: 'Center', label: '∇L₀' },
              { from: 'GPU 1', to: 'Center', label: '∇L₁' },
              { from: 'GPU 2', to: 'Center', label: '∇L₂' },
              { from: 'GPU 3', to: 'Center', label: '∇L₃' },
              { from: 'Center', to: 'All GPUs', label: 'Σ∇L', operation: 'SUM' },
            ],
          },
          whenToUse: [
            'Synchronizing gradients in distributed training (PyTorch DDP, Horovod) - Critical for maintaining model consistency across GPUs',
            'Averaging model parameters across all workers - Ensures all replicas have identical weights after each update',
            'Aggregating metrics from all processes - Computing global accuracy, loss, or other evaluation metrics',
            'Any operation where all processes need the same reduced result - When synchronization is required before proceeding',
            'Real-world example: In PyTorch DistributedDataParallel, gradients are averaged using All-Reduce after each backward pass',
            'Performance note: Modern implementations use ring or tree algorithms to minimize communication overhead',
          ],
        }
      case 'all-gather':
        return {
          title: 'Example: Collecting Partial Results from All GPUs',
          description: 'Each GPU has computed part of a matrix multiplication. All-Gather collects all parts.',
          matrices: {
            'GPU 0 (A₀×B)': exampleMatrices.A,
            'GPU 1 (A₁×B)': exampleMatrices.B,
            'GPU 2 (A₂×B)': exampleMatrices.C,
            'GPU 3 (A₃×B)': exampleMatrices.D,
          },
          operation: 'CONCATENATE',
          result: null,
          formula: '[A₀×B, A₁×B, A₂×B, A₃×B] → All GPUs',
          flowDiagram: {
            steps: [
              { from: 'GPU 0', to: 'GPU 1,2,3', label: 'A₀×B' },
              { from: 'GPU 1', to: 'GPU 0,2,3', label: 'A₁×B' },
              { from: 'GPU 2', to: 'GPU 0,1,3', label: 'A₂×B' },
              { from: 'GPU 3', to: 'GPU 0,1,2', label: 'A₃×B' },
            ],
          },
          whenToUse: [
            'Collecting embeddings from all GPUs for attention mechanisms - Each GPU computes embeddings for its batch, all need complete context',
            'Gathering partial results when all processes need complete data - Reconstructing full dataset from distributed chunks',
            'Distributed inference where all nodes need full output - Each node processes part of input, all need complete result',
            'Data parallelism with model parallelism (pipeline parallelism) - Combining results from different pipeline stages',
            'Real-world example: In transformer models, All-Gather collects key-value pairs from all GPUs for cross-attention computation',
            'Use case: When implementing custom distributed algorithms that require all-to-all data sharing',
          ],
        }
      case 'gather':
        return {
          title: 'Example: Collecting Final Results to Root GPU',
          description: 'Each GPU computed A × B. Gather collects all results to GPU 0 for final processing.',
          matrices: {
            'GPU 0 (A₀×B)': exampleMatrices.A,
            'GPU 1 (A₁×B)': exampleMatrices.B,
            'GPU 2 (A₂×B)': exampleMatrices.C,
            'GPU 3 (A₃×B)': exampleMatrices.D,
          },
          operation: 'COLLECT',
          result: null,
          formula: '[A₀×B, A₁×B, A₂×B, A₃×B] → GPU 0 only',
          flowDiagram: {
            steps: [
              { from: 'GPU 1', to: 'GPU 0', label: 'A₁×B' },
              { from: 'GPU 2', to: 'GPU 0', label: 'A₂×B' },
              { from: 'GPU 3', to: 'GPU 0', label: 'A₃×B' },
            ],
          },
          whenToUse: [
            'Collecting results to rank 0 for logging and checkpointing - Master process saves model state and training logs',
            'Gathering metrics from all workers to master process - Aggregating validation results for monitoring',
            'Saving model outputs from distributed inference - Collecting predictions from all GPUs to single location',
            'When only one process needs the complete data - Efficient when other processes don\'t require gathered data',
            'Real-world example: PyTorch Lightning uses Gather to collect validation metrics from all GPUs to rank 0 for logging',
            'Performance note: More efficient than All-Gather when only root process needs the data, reducing unnecessary communication',
          ],
        }
      case 'scatter':
        return {
          title: 'Example: Distributing Matrix Chunks for Parallel Computation',
          description: 'Root GPU splits matrix A into chunks and distributes them. Each GPU computes its chunk × B.',
          matrices: {
            'Root (A)': exampleMatrices.A,
          },
          operation: 'SPLIT',
          result: null,
          formula: 'A → [A₀→GPU0, A₁→GPU1, A₂→GPU2, A₃→GPU3]',
          flowDiagram: {
            steps: [
              { from: 'GPU 0 (Root)', to: 'GPU 0', label: 'A₀' },
              { from: 'GPU 0 (Root)', to: 'GPU 1', label: 'A₁' },
              { from: 'GPU 0 (Root)', to: 'GPU 2', label: 'A₂' },
              { from: 'GPU 0 (Root)', to: 'GPU 3', label: 'A₃' },
            ],
          },
          whenToUse: [
            'Data parallelism: splitting dataset across GPUs - Each GPU processes different subset of training data',
            'Distributing input batches to workers - Efficiently sending different data chunks to each process',
            'Initial data distribution in distributed training - Setting up data shards at the start of training',
            'When root process needs to split and send data - Master process divides workload among workers',
            'Real-world example: In data parallel training, Scatter distributes different mini-batches to each GPU for parallel processing',
            'Use case: Implementing custom data loaders that split large datasets across multiple GPUs for parallel processing',
          ],
        }
      case 'broadcast':
        return {
          title: 'Example: Broadcasting Weight Matrix to All GPUs',
          description: 'Root GPU broadcasts weight matrix W to all GPUs. Each GPU uses W for local computation.',
          matrices: {
            'Root (W)': exampleMatrices.A,
          },
          operation: 'COPY',
          result: exampleMatrices.A,
          formula: 'W → [W→GPU0, W→GPU1, W→GPU2, W→GPU3]',
          flowDiagram: {
            steps: [
              { from: 'GPU 0 (Root)', to: 'GPU 1', label: 'W' },
              { from: 'GPU 0 (Root)', to: 'GPU 2', label: 'W' },
              { from: 'GPU 0 (Root)', to: 'GPU 3', label: 'W' },
            ],
          },
          whenToUse: [
            'Distributing model weights at start of training - Ensuring all GPUs start with identical model parameters',
            'Broadcasting hyperparameters to all workers - Sharing learning rate, batch size, and other configs',
            'Sending initial data to all processes - Distributing same input data when needed (e.g., validation set)',
            'Synchronizing model state across replicas - Keeping model weights consistent after checkpoint loading',
            'Real-world example: PyTorch DDP uses Broadcast to initialize all processes with the same model weights from rank 0',
            'Performance note: Broadcast is highly optimized using tree algorithms, making it efficient even for large models',
          ],
        }
      case 'reduce':
        return {
          title: 'Example: Summing Loss Values from All GPUs',
          description: 'Each GPU computed loss. Reduce sums all losses and sends result to root for logging.',
          matrices: {
            'GPU 0 (L₀)': exampleMatrices.A,
            'GPU 1 (L₁)': exampleMatrices.B,
            'GPU 2 (L₂)': exampleMatrices.C,
            'GPU 3 (L₃)': exampleMatrices.D,
          },
          operation: 'SUM',
          result: exampleMatrices.A.map((row, i) =>
            row.map((_, j) =>
              exampleMatrices.A[i][j] + exampleMatrices.B[i][j] + exampleMatrices.C[i][j] + exampleMatrices.D[i][j]
            )
          ),
          formula: 'Σ(L₀ + L₁ + L₂ + L₃) → GPU 0 only',
          flowDiagram: {
            steps: [
              { from: 'GPU 1', to: 'GPU 0', label: 'L₁' },
              { from: 'GPU 2', to: 'GPU 0', label: 'L₂' },
              { from: 'GPU 3', to: 'GPU 0', label: 'L₃' },
              { from: 'GPU 0', to: 'GPU 0', label: 'ΣL', operation: 'SUM' },
            ],
          },
          whenToUse: [
            'Aggregating loss values to root for logging - Summing losses from all batches to compute total training loss',
            'Computing global metrics (accuracy, F1-score) - Calculating overall model performance across all GPUs',
            'Early stopping decisions based on validation loss - Root process needs aggregated validation loss to make decisions',
            'When only root process needs the reduced result - Efficient when other processes don\'t need the aggregated value',
            'Real-world example: TensorFlow uses Reduce to aggregate validation metrics to the chief worker for monitoring and checkpointing',
            'Performance note: More efficient than All-Reduce when only root needs the result, saving bandwidth and computation',
          ],
        }
      default:
        return null
    }
  }

  const example = getExample()
  if (!example) return null

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-purple-100 rounded-full p-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">{example.title}</h4>
          <p className="text-sm text-gray-700 mb-3">{example.description}</p>
          {example.formula && (
            <div className="bg-white rounded px-3 py-2 mb-3 border border-purple-200">
              <code className="text-sm font-mono text-purple-700">{example.formula}</code>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Source Matrices */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Input Matrices:
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(example.matrices).map(([gpu, matrix], idx) => (
              <motion.div
                key={gpu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-3 shadow-sm border-2 border-transparent hover:border-blue-300 transition-all"
              >
                <div className="text-xs font-semibold text-gray-600 mb-2 text-center">{gpu}</div>
                <div className="flex justify-center">
                  <MatrixDisplay matrix={matrix} processId={gpu} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Operation Arrow with Animation */}
        <div className="flex items-center justify-center py-2">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-lg"
          >
            <div className="text-sm font-bold text-white">{example.operation}</div>
          </motion.div>
        </div>

        {/* Result */}
        {example.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Result (after {example.operation}):
            </h5>
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-green-300 inline-block">
              <MatrixDisplay matrix={example.result} highlight processId="result" />
            </div>
          </motion.div>
        )}

        {/* Flow Diagram */}
        {example.flowDiagram && (
          <FlowDiagram steps={example.flowDiagram.steps} operation={operation} />
        )}

        {/* When to Use */}
        {example.whenToUse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
          >
            <h5 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              When to Use This Operation:
            </h5>
            <ul className="space-y-2">
              {example.whenToUse.map((useCase, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* MatMul Context */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-purple-700 mb-1">Matrix Multiplication Context:</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {operation === 'all-reduce' && 'Each GPU computes gradients ∇L_i from its batch. All-Reduce computes Σ∇L_i and distributes the averaged gradient to all GPUs for synchronized weight updates.'}
                {operation === 'all-gather' && 'Each GPU computes A_i × B where A is split across GPUs. All-Gather collects all A_i × B results so every GPU has the complete concatenated output [A₀×B, A₁×B, A₂×B, A₃×B].'}
                {operation === 'gather' && 'Each GPU computes A_i × B independently. Gather collects all results [A₀×B, A₁×B, A₂×B, A₃×B] to GPU 0 only for final aggregation, checkpointing, or logging.'}
                {operation === 'scatter' && 'Root GPU splits matrix A into chunks [A₀, A₁, A₂, A₃]. Scatter sends A_i to GPU i. Each GPU then computes A_i × B in parallel, enabling data parallelism.'}
                {operation === 'broadcast' && 'Root GPU has weight matrix W (from model parameters). Broadcast sends identical copy of W to all GPUs. Each GPU uses W for local forward/backward pass computations.'}
                {operation === 'reduce' && 'Each GPU computes loss L_i from its batch. Reduce computes ΣL_i (sum of all losses) and sends the total to root GPU only for logging, early stopping decisions, or monitoring.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Flow Diagram Component
interface FlowStep {
  from: string
  to: string
  label: string
  operation?: string
}

function FlowDiagram({ steps, operation }: { steps: FlowStep[]; operation: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-300 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 rounded-full p-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h5 className="text-lg font-bold text-gray-800">Data Flow Diagram</h5>
          <p className="text-xs text-gray-600">Visual representation of data movement between GPUs</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * idx, type: 'spring', stiffness: 100 }}
            className="relative bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Source */}
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm min-w-[100px] text-center shadow-md">
                  {step.from}
                </div>
                
                {/* Animated Arrow */}
                <div className="flex-1 flex items-center justify-center relative">
                  <motion.div
                    animate={{
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.2,
                    }}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {step.operation && (
                      <motion.span
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg"
                      >
                        {step.operation}
                      </motion.span>
                    )}
                  </motion.div>
                </div>

                {/* Destination */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm min-w-[100px] text-center shadow-md">
                  {step.to}
                </div>
              </div>

              {/* Data Label */}
              <div className="bg-gray-100 border-2 border-gray-300 text-gray-800 px-3 py-2 rounded-lg text-xs font-mono font-semibold min-w-[80px] text-center">
                {step.label}
              </div>
            </div>

            {/* Step Number Badge */}
            <div className="absolute -top-2 -left-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
              {idx + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Operation Pattern Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h6 className="text-sm font-bold text-indigo-800 mb-2">Operation Pattern:</h6>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              {operation === 'all-reduce' && 'All processes send their local data to a central reduction point. The reduction operation (SUM, MAX, MIN, etc.) is applied, and the result is sent back to all processes. This ensures all GPUs have the same aggregated value.'}
              {operation === 'all-gather' && 'Each process sends its local data to all other processes simultaneously. After completion, every process has a concatenated copy of all data from all processes. This creates a complete dataset on each GPU.'}
              {operation === 'gather' && 'All processes send their local data to the root process (typically GPU 0). Only the root process receives the complete collected data. Other processes do not receive the gathered data.'}
              {operation === 'scatter' && 'The root process (GPU 0) splits its data into chunks and distributes different chunks to each process. Each process receives a unique portion of the data. This is the inverse of gather.'}
              {operation === 'broadcast' && 'The root process (GPU 0) sends an identical copy of its data to all other processes. All processes end up with the same data. This is commonly used to distribute model weights or hyperparameters.'}
              {operation === 'reduce' && 'All processes send their local data to the root process, where a reduction operation (SUM, MAX, MIN, etc.) is applied. Only the root process receives the reduced result. This is useful for aggregating metrics or losses.'}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-indigo-700">Communication Pattern:</span>{' '}
                {operation === 'all-reduce' && 'Ring or Tree topology for efficient bandwidth usage'}
                {operation === 'all-gather' && 'All-to-all communication pattern'}
                {operation === 'gather' && 'Many-to-one communication (star topology)'}
                {operation === 'scatter' && 'One-to-many communication (star topology)'}
                {operation === 'broadcast' && 'One-to-many communication (star or tree topology)'}
                {operation === 'reduce' && 'Many-to-one communication with reduction (star topology)'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MatrixDisplay({
  matrix,
  highlight = false,
  processId,
  getCellState,
  isPlaying: _isPlaying = false,
}: MatrixDisplayProps) {
  return (
    <div className={`matrix-display ${highlight ? 'highlight' : ''}`} data-process-id={processId}>
      {matrix.map((row, i) => (
        <div key={i} className="matrix-row">
          {row.map((cell, j) => {
            const state = getCellState ? getCellState(i, j) : { isActive: false, isCompleted: false }
            return (
              <motion.div
                key={j}
                className={`matrix-cell ${state.isActive ? 'receiving' : ''} ${state.isCompleted ? 'completed' : ''}`}
                data-value={cell}
                animate={{
                  scale: state.isActive ? [1, 1.2, 1] : 1,
                  backgroundColor: state.isActive
                    ? ['#dbeafe', '#93c5fd', '#dbeafe']
                    : state.isCompleted
                    ? '#dbeafe'
                    : highlight
                    ? '#dbeafe'
                    : '#f3f4f6',
                }}
                transition={{ duration: 0.4 }}
              >
                {cell}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface AnimatedCellFlowProps {
  processes: Process[]
  resultMatrix: number[][] | null
  currentStep: number
  totalCells: number
  direction: 'all-reduce' | 'gather' | 'scatter' | 'broadcast' | 'reduce'
}

function AnimatedCellFlow({
  processes,
  resultMatrix,
  currentStep,
  totalCells,
  direction,
}: AnimatedCellFlowProps) {
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([])
  const targetRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    processes.forEach((process) => {
      const sourceEl = document.querySelector(`[data-process-id="${process.id}"]`)
      if (sourceEl) {
        sourceRefs.current[process.id] = sourceEl as HTMLDivElement
      }
    })

    if (direction === 'all-reduce') {
      const centerEl = document.querySelector('[data-process-id="center"]')
      if (centerEl) targetRefs.current[0] = centerEl as HTMLDivElement
    } else if (direction === 'gather' || direction === 'reduce') {
      const rootEl = document.querySelector('[data-process-id="0"]')
      if (rootEl) targetRefs.current[0] = rootEl as HTMLDivElement
    }
  }, [processes, direction])

  const getActiveCells = () => {
    const cells: Array<{ value: number; sourceId: number; targetId: number | string; cellIndex: number }> = []
    
    if (direction === 'all-reduce') {
      // Phase 1: Send to center
      if (currentStep < totalCells) {
        processes.forEach((process) => {
          process.matrix.flat().forEach((value, idx) => {
            const globalIndex = process.id * 9 + idx
            if (globalIndex < currentStep && globalIndex >= currentStep - 3) {
              cells.push({ value, sourceId: process.id, targetId: 'center', cellIndex: idx })
            }
          })
        })
      }
      // Phase 2: Receive from center
      else {
        const receiveStep = currentStep - totalCells
        processes.forEach((process) => {
          if (resultMatrix) {
            resultMatrix.flat().forEach((value, idx) => {
              const globalIndex = process.id * 9 + idx
              if (globalIndex < receiveStep && globalIndex >= receiveStep - 3) {
                cells.push({ value, sourceId: 'center' as any, targetId: process.id, cellIndex: idx })
              }
            })
          }
        })
      }
    } else if (direction === 'gather' || direction === 'reduce') {
      processes.forEach((process) => {
        process.matrix.flat().forEach((value, idx) => {
          const globalIndex = process.id * 9 + idx
          if (globalIndex < currentStep && globalIndex >= currentStep - 3) {
            cells.push({ value, sourceId: process.id, targetId: 0, cellIndex: idx })
          }
        })
      })
    } else if (direction === 'scatter') {
      processes.forEach((process, processIdx) => {
        process.matrix.flat().forEach((value, idx) => {
          const globalIndex = processIdx * 9 + idx
          if (globalIndex < currentStep && globalIndex >= currentStep - 3) {
            cells.push({ value, sourceId: 0, targetId: process.id, cellIndex: idx })
          }
        })
      })
    } else if (direction === 'broadcast') {
      processes.slice(1).forEach((process, processIdx) => {
        processes[0].matrix.flat().forEach((value, idx) => {
          const globalIndex = processIdx * 9 + idx
          if (globalIndex < currentStep && globalIndex >= currentStep - 3) {
            cells.push({ value, sourceId: 0, targetId: process.id, cellIndex: idx })
          }
        })
      })
    }

    return cells
  }

  const activeCells = getActiveCells()

  return (
    <div className="animated-cells-container">
      <AnimatePresence>
        {activeCells.map((cell, idx) => {
          const sourceEl = sourceRefs.current[cell.sourceId as number]
          const targetEl = targetRefs.current[0] || sourceRefs.current[cell.targetId as number]

          if (!sourceEl || !targetEl) return null

          const sourceRect = sourceEl.getBoundingClientRect()
          const targetRect = targetEl.getBoundingClientRect()
          const cellRow = Math.floor(cell.cellIndex / 3)
          const cellCol = cell.cellIndex % 3

          // Get container bounds - find the visualization container
          const container = sourceEl.closest('.bg-gradient-to-br') || document.querySelector('.bg-gradient-to-br.from-gray-50')
          const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }

          // Calculate positions relative to container, ensuring they stay within bounds
          const cellOffsetX = (cellCol - 1) * 45
          const cellOffsetY = (cellRow - 1) * 45
          
          const sourceX = Math.max(0, Math.min(
            sourceRect.left - containerRect.left + sourceRect.width / 2 + cellOffsetX,
            containerRect.width
          ))
          const sourceY = Math.max(0, Math.min(
            sourceRect.top - containerRect.top + sourceRect.height / 2 + cellOffsetY,
            containerRect.height
          ))
          const targetX = Math.max(0, Math.min(
            targetRect.left - containerRect.left + targetRect.width / 2 + cellOffsetX,
            containerRect.width
          ))
          const targetY = Math.max(0, Math.min(
            targetRect.top - containerRect.top + targetRect.height / 2 + cellOffsetY,
            containerRect.height
          ))

          return (
            <motion.div
              key={`${cell.sourceId}-${cell.targetId}-${cell.cellIndex}-${idx}`}
              className="floating-cell"
              initial={{
                x: sourceX,
                y: sourceY,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: targetX,
                y: targetY,
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.5, 1.3, 1.2, 0.8, 0.3],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 1.8,
                ease: [0.4, 0, 0.2, 1],
                delay: idx * 0.1,
              }}
              style={{
                left: 0,
                top: 0,
              }}
            >
              {cell.value}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
