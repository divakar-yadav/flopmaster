import { useState, useMemo } from 'react'
import { nvidiaGpus, getGpusBySeries, type NvidiaGpu } from '../data/nvidiaGpus'
import MaterialSelect, { type SelectOption } from './MaterialSelect'

interface MatrixDimensions {
  rows: number
  cols: number
}

interface FlopsResult {
  totalFlops: number
  multiplications: number
  additions: number
  outputDimensions: MatrixDimensions
}

interface ExecutionTime {
  seconds: number
  milliseconds: number
  microseconds: number
  nanoseconds: number
  formatted: string
}

export interface PrecisionType {
  value: string
  label: string
  multiplier: number // Multiplier relative to FP32 (1.0 = FP32)
  description: string
}

export const precisionTypes: PrecisionType[] = [
  {
    value: 'fp32',
    label: 'FP32 (Single Precision)',
    multiplier: 1.0,
    description: '32-bit floating point (default)',
  },
  {
    value: 'fp16',
    label: 'FP16 (Half Precision)',
    multiplier: 2.0,
    description: '16-bit floating point (~2x faster)',
  },
  {
    value: 'bf16',
    label: 'BF16 (BFloat16)',
    multiplier: 2.0,
    description: 'Brain Float 16-bit (~2x faster)',
  },
  {
    value: 'int8',
    label: 'INT8 (8-bit Integer)',
    multiplier: 4.0,
    description: '8-bit integer quantization (~4x faster)',
  },
  {
    value: 'int4',
    label: 'INT4 (4-bit Integer)',
    multiplier: 8.0,
    description: '4-bit integer quantization (~8x faster)',
  },
  {
    value: 'fp64',
    label: 'FP64 (Double Precision)',
    multiplier: 0.5,
    description: '64-bit floating point (~2x slower)',
  },
]

// Get adjusted TFLOPS based on precision
function getAdjustedTflops(baseTflops: number, precision: PrecisionType): number {
  return baseTflops * precision.multiplier
}

function calculateFlops(
  matrixA: MatrixDimensions,
  matrixB: MatrixDimensions
): FlopsResult | null {
  // Check if matrix multiplication is possible
  if (matrixA.cols !== matrixB.rows) {
    return null
  }

  const m = matrixA.rows
  const n = matrixA.cols // same as matrixB.rows
  const p = matrixB.cols

  // Output matrix dimensions
  const outputDimensions: MatrixDimensions = {
    rows: m,
    cols: p,
  }

  // For each element in the output matrix (m × p elements):
  // - We need n multiplications
  // - We need (n - 1) additions
  const multiplications = m * p * n
  const additions = m * p * (n - 1)
  const totalFlops = multiplications + additions

  return {
    totalFlops,
    multiplications,
    additions,
    outputDimensions,
  }
}

function formatNumber(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T'
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K'
  }
  return num.toString()
}

function calculateExecutionTime(
  totalFlops: number,
  gpuTflops: number,
  precision: PrecisionType = precisionTypes[0]
): ExecutionTime {
  // Adjust TFLOPS based on precision
  const adjustedTflops = getAdjustedTflops(gpuTflops, precision)
  
  // GPU TFLOPS is in TeraFLOPS (10^12 operations per second)
  // Time in seconds = Total FLOPs / (Adjusted GPU TFLOPS * 10^12)
  const seconds = totalFlops / (adjustedTflops * 1e12)
  const milliseconds = seconds * 1000
  const microseconds = milliseconds * 1000
  const nanoseconds = microseconds * 1000

  // Format time in the most appropriate unit
  let formatted: string
  if (seconds >= 1) {
    formatted = `${seconds.toFixed(6)} s`
  } else if (milliseconds >= 1) {
    formatted = `${milliseconds.toFixed(6)} ms`
  } else if (microseconds >= 1) {
    formatted = `${microseconds.toFixed(6)} μs`
  } else {
    formatted = `${nanoseconds.toFixed(3)} ns`
  }

  return {
    seconds,
    milliseconds,
    microseconds,
    nanoseconds,
    formatted,
  }
}

export default function MatrixFlopsCalculator() {
  const [matrixA, setMatrixA] = useState<MatrixDimensions>({ rows: 3, cols: 4 })
  const [matrixB, setMatrixB] = useState<MatrixDimensions>({ rows: 4, cols: 5 })
  const [selectedGpu, setSelectedGpu] = useState<NvidiaGpu | null>(nvidiaGpus[0])
  const [selectedPrecision, setSelectedPrecision] = useState<PrecisionType>(precisionTypes[0])

  const result = calculateFlops(matrixA, matrixB)
  const isValid = result !== null

  const gpusBySeries = getGpusBySeries()
  const executionTime = result && selectedGpu
    ? calculateExecutionTime(result.totalFlops, selectedGpu.tflops, selectedPrecision)
    : null

  // Convert GPU data to MaterialSelect options
  const gpuOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = []
    Object.entries(gpusBySeries).forEach(([series, gpus]) => {
      gpus.forEach((gpu) => {
        options.push({
          value: gpu.name,
          label: `${gpu.name} (${gpu.tflops} TFLOPS${gpu.memory ? `, ${gpu.memory}` : ''})`,
          group: series,
        })
      })
    })
    return options
  }, [gpusBySeries])

  // Convert precision types to MaterialSelect options
  const precisionOptions: SelectOption[] = useMemo(() => {
    return precisionTypes.map((precision) => ({
      value: precision.value,
      label: precision.label,
    }))
  }, [])

  // Calculate adjusted TFLOPS for selected GPU and precision
  const adjustedTflops = selectedGpu
    ? getAdjustedTflops(selectedGpu.tflops, selectedPrecision)
    : 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Matrix A */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Matrix A
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="a-rows"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rows (m)
                </label>
                <input
                  id="a-rows"
                  type="number"
                  min="1"
                  value={matrixA.rows}
                  onChange={(e) =>
                    setMatrixA({
                      ...matrixA,
                      rows: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="a-cols"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Columns (n)
                </label>
                <input
                  id="a-cols"
                  type="number"
                  min="1"
                  value={matrixA.cols}
                  onChange={(e) =>
                    setMatrixA({
                      ...matrixA,
                      cols: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Size:</span> {matrixA.rows} ×{' '}
                {matrixA.cols}
              </p>
            </div>
          </div>

          {/* Matrix B */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Matrix B
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="b-rows"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rows (n)
                </label>
                <input
                  id="b-rows"
                  type="number"
                  min="1"
                  value={matrixB.rows}
                  onChange={(e) =>
                    setMatrixB({
                      ...matrixB,
                      rows: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="b-cols"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Columns (p)
                </label>
                <input
                  id="b-cols"
                  type="number"
                  min="1"
                  value={matrixB.cols}
                  onChange={(e) =>
                    setMatrixB({
                      ...matrixB,
                      cols: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Size:</span> {matrixB.rows} ×{' '}
                {matrixB.cols}
              </p>
            </div>
          </div>
        </div>

        {/* GPU Selection Section */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Select NVIDIA GPU & Precision
          </h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <MaterialSelect
                id="gpu-select"
                label="GPU Model"
                value={selectedGpu?.name || ''}
                onChange={(value) => {
                  const gpu = nvidiaGpus.find(g => g.name === value)
                  setSelectedGpu(gpu || null)
                }}
                options={gpuOptions}
              />
              <MaterialSelect
                id="precision-select"
                label="Precision Type"
                value={selectedPrecision.value}
                onChange={(value) => {
                  const precision = precisionTypes.find(p => p.value === value)
                  if (precision) setSelectedPrecision(precision)
                }}
                options={precisionOptions}
              />
            </div>
            {selectedGpu && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Architecture</div>
                    <div className="font-semibold text-gray-800">{selectedGpu.architecture}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Base Performance (FP32)</div>
                    <div className="font-semibold text-gray-800">{selectedGpu.tflops} TFLOPS</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Selected Precision</div>
                    <div className="font-semibold text-gray-800">{selectedPrecision.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{selectedPrecision.description}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Adjusted Performance</div>
                    <div className="font-semibold text-blue-600">{adjustedTflops.toFixed(2)} TFLOPS</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedPrecision.multiplier > 1
                        ? `${selectedPrecision.multiplier}x faster`
                        : selectedPrecision.multiplier < 1
                        ? `${(1 / selectedPrecision.multiplier).toFixed(1)}x slower`
                        : 'Base performance'}
                    </div>
                  </div>
                  {selectedGpu.memory && (
                    <div className="md:col-span-4">
                      <div className="text-sm text-gray-600 mb-1">Memory</div>
                      <div className="font-semibold text-gray-800">{selectedGpu.memory}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Message */}
        {!isValid && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">
              <span className="font-semibold">Invalid dimensions:</span> Matrix
              A columns ({matrixA.cols}) must equal Matrix B rows ({matrixB.rows}
              ) for matrix multiplication.
            </p>
          </div>
        )}

        {/* Matrix Multiplication Visualization */}
        {isValid && result && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-blue-100 px-6 py-3 rounded-lg font-mono text-lg">
                [{matrixA.rows} × {matrixA.cols}]
              </div>
              <div className="text-3xl text-gray-600">×</div>
              <div className="bg-purple-100 px-6 py-3 rounded-lg font-mono text-lg">
                [{matrixB.rows} × {matrixB.cols}]
              </div>
              <div className="text-3xl text-gray-600">=</div>
              <div className="bg-green-100 px-6 py-3 rounded-lg font-mono text-lg">
                [{result.outputDimensions.rows} × {result.outputDimensions.cols}
                ]
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-4">FLOPs Calculation</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">
                    Total FLOPs
                  </div>
                  <div className="text-3xl font-bold">
                    {formatNumber(result.totalFlops)}
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    ({result.totalFlops.toLocaleString()} operations)
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">
                    Multiplications
                  </div>
                  <div className="text-3xl font-bold">
                    {formatNumber(result.multiplications)}
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    ({result.multiplications.toLocaleString()} operations)
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">Additions</div>
                  <div className="text-3xl font-bold">
                    {formatNumber(result.additions)}
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    ({result.additions.toLocaleString()} operations)
                  </div>
                </div>
              </div>

              {/* Execution Time Calculation */}
              {executionTime && selectedGpu && (
                <div>
                  <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h4 className="text-lg font-bold mb-3">
                      Execution Time on {selectedGpu.name} ({selectedPrecision.label})
                    </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Estimated Time:</span>
                      <span className="text-2xl font-bold">{executionTime.formatted}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
                      <div>
                        <div className="opacity-75">Seconds</div>
                        <div className="font-mono">{executionTime.seconds.toExponential(3)}</div>
                      </div>
                      <div>
                        <div className="opacity-75">Milliseconds</div>
                        <div className="font-mono">{executionTime.milliseconds.toExponential(3)}</div>
                      </div>
                      <div>
                        <div className="opacity-75">Microseconds</div>
                        <div className="font-mono">{executionTime.microseconds.toExponential(3)}</div>
                      </div>
                      <div>
                        <div className="opacity-75">Nanoseconds</div>
                        <div className="font-mono">{executionTime.nanoseconds.toExponential(3)}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-75">
                      <div className="font-mono">
                        Base TFLOPS: {selectedGpu.tflops} TFLOPS (FP32)
                      </div>
                      <div className="font-mono mt-1">
                        Adjusted TFLOPS: {adjustedTflops.toFixed(2)} TFLOPS ({selectedPrecision.label})
                      </div>
                      <div className="font-mono mt-1">
                        Time = {result.totalFlops.toLocaleString()} FLOPs ÷ ({adjustedTflops.toFixed(2)} × 10¹² FLOPs/s) = {executionTime.formatted}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Performance Disclaimer */}
                  <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h5 className="text-sm font-semibold text-amber-800 mb-2">
                          Performance Disclaimer
                        </h5>
                        <p className="text-sm text-amber-700 mb-2">
                          Peak performance numbers (including for {selectedGpu.name}) assume the following optimal conditions:
                        </p>
                        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                          <li>Massive parallelism</li>
                          <li>Fully occupied SMs (Streaming Multiprocessors)</li>
                          <li>Large tiles</li>
                          <li>Tensor Core–friendly shapes</li>
                          <li>No memory stalls</li>
                          <li>No launch overhead</li>
                        </ul>
                        <p className="text-xs text-amber-600 mt-2 italic">
                          Actual performance may vary based on workload characteristics, memory bandwidth, kernel efficiency, and system configuration. These calculations represent theoretical peak performance under ideal conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formula Explanation */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Calculation Formula:</div>
                <div className="font-mono text-sm">
                  For A[{matrixA.rows} × {matrixA.cols}] × B[{matrixB.rows} ×{' '}
                  {matrixB.cols}]
                </div>
                <div className="font-mono text-sm mt-2">
                  Multiplications = m × p × n = {matrixA.rows} × {matrixB.cols}{' '}
                  × {matrixA.cols} = {result.multiplications}
                </div>
                <div className="font-mono text-sm mt-2">
                  Additions = m × p × (n - 1) = {matrixA.rows} × {matrixB.cols}{' '}
                  × ({matrixA.cols} - 1) = {result.additions}
                </div>
                <div className="font-mono text-sm mt-2 font-semibold">
                  Total FLOPs = {result.multiplications} + {result.additions} ={' '}
                  {result.totalFlops}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

