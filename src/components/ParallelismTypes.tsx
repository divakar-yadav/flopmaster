import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ParallelismType {
  id: string
  name: string
  shortName: string
  description: string
  pros: string[]
  cons: string[]
  useCases: string[]
  frameworks: string[]
  visualization: 'data' | 'model' | 'pipeline' | 'tensor' | 'sequence' | 'expert'
}

const parallelismTypes: ParallelismType[] = [
  {
    id: 'data',
    name: 'Data Parallelism',
    shortName: 'DP',
    description: 'Each GPU holds a complete copy of the model and processes different batches of data. Gradients are synchronized across GPUs after each backward pass.',
    pros: [
      'Simple to implement and widely supported',
      'No model modifications required',
      'Scales well with batch size',
      'Efficient for large datasets',
      'Works with any model architecture'
    ],
    cons: [
      'Requires gradient synchronization (communication overhead)',
      'Memory usage scales with model size (each GPU holds full model)',
      'Limited by single GPU memory for very large models',
      'Communication bottleneck with many GPUs'
    ],
    useCases: [
      'Training large models that fit in single GPU memory',
      'Distributed training with PyTorch DDP or TensorFlow MirroredStrategy',
      'When you have more data than can fit in one GPU',
      'Fine-tuning pre-trained models across multiple GPUs'
    ],
    frameworks: ['PyTorch DDP', 'TensorFlow MirroredStrategy', 'Horovod', 'DeepSpeed ZeRO-1'],
    visualization: 'data'
  },
  {
    id: 'model',
    name: 'Model Parallelism',
    shortName: 'MP',
    description: 'The model is split across multiple GPUs, with each GPU holding a portion of the model layers. Data flows sequentially through the GPUs.',
    pros: [
      'Enables training models larger than single GPU memory',
      'No gradient synchronization needed',
      'Each GPU processes full batch sequentially'
    ],
    cons: [
      'Sequential processing creates pipeline bubbles',
      'Complex to implement and debug',
      'Lower GPU utilization (GPUs wait for each other)',
      'Communication overhead between layers'
    ],
    useCases: [
      'Training models too large for single GPU',
      'When model layers can be cleanly partitioned',
      'Legacy approach before pipeline parallelism'
    ],
    frameworks: ['PyTorch RPC', 'TensorFlow Model Parallelism', 'Megatron-LM (legacy)'],
    visualization: 'model'
  },
  {
    id: 'pipeline',
    name: 'Pipeline Parallelism',
    shortName: 'PP',
    description: 'Model layers are split across GPUs, and different micro-batches are processed in parallel. Uses gradient accumulation to maintain correctness.',
    pros: [
      'Enables training very large models',
      'Better GPU utilization than model parallelism',
      'Overlaps computation and communication',
      'Scales to hundreds of GPUs'
    ],
    cons: [
      'Pipeline bubbles reduce efficiency',
      'Requires careful micro-batch scheduling',
      'Complex gradient accumulation logic',
      'Memory overhead for activations'
    ],
    useCases: [
      'Training transformer models with billions of parameters',
      'GPT-3, GPT-4, PaLM scale training',
      'When model is too large for data parallelism',
      'Combined with data parallelism for maximum scale'
    ],
    frameworks: ['DeepSpeed Pipeline', 'FairScale Pipeline', 'GPipe', 'Megatron-LM'],
    visualization: 'pipeline'
  },
  {
    id: 'tensor',
    name: 'Tensor Parallelism',
    shortName: 'TP',
    description: 'Individual matrix operations (like attention or MLP layers) are split across GPUs. Each GPU computes part of the matrix multiplication.',
    pros: [
      'Very efficient for transformer attention layers',
      'Low communication overhead (only within layers)',
      'Enables training extremely large models',
      'Works well with data parallelism'
    ],
    cons: [
      'Requires model architecture modifications',
      'Communication within each forward/backward pass',
      'Complex to implement correctly',
      'Limited by attention head size'
    ],
    useCases: [
      'Large transformer models (GPT, BERT, T5)',
      'Attention mechanism parallelization',
      'MLP layer parallelization',
      'Combined with pipeline parallelism for maximum scale'
    ],
    frameworks: ['Megatron-LM', 'DeepSpeed', 'Colossal-AI', 'FairScale'],
    visualization: 'tensor'
  },
  {
    id: 'sequence',
    name: 'Sequence Parallelism',
    shortName: 'SP',
    description: 'The sequence dimension (sequence length) is split across GPUs. Each GPU processes a chunk of the sequence tokens.',
    pros: [
      'Reduces activation memory per GPU',
      'Enables longer sequences',
      'Works well with tensor parallelism',
      'Reduces memory for attention matrices'
    ],
    cons: [
      'Requires communication for attention computation',
      'More complex attention implementation',
      'Limited by sequence chunk size'
    ],
    useCases: [
      'Training with very long sequences',
      'Reducing activation memory in transformers',
      'Combined with tensor parallelism',
      'Long context language models'
    ],
    frameworks: ['DeepSpeed', 'Megatron-LM', 'Colossal-AI'],
    visualization: 'sequence'
  },
  {
    id: 'expert',
    name: 'Expert Parallelism',
    shortName: 'EP',
    description: 'Used in Mixture-of-Experts (MoE) models. Different experts are placed on different GPUs, and tokens are routed to appropriate experts.',
    pros: [
      'Enables training models with trillions of parameters',
      'Only active experts consume compute',
      'Scales model size without proportional compute increase',
      'Efficient for sparse activation patterns'
    ],
    cons: [
      'Requires MoE architecture',
      'Load balancing challenges',
      'Communication overhead for token routing',
      'Complex routing logic'
    ],
    useCases: [
      'Mixture-of-Experts models (Switch Transformer, GShard)',
      'Training models with 1T+ parameters',
      'Sparse activation patterns',
      'Google PaLM, Switch Transformer scale'
    ],
    frameworks: ['GShard', 'Switch Transformer', 'DeepSpeed MoE', 'FairScale MoE'],
    visualization: 'expert'
  }
]

export default function ParallelismTypes() {
  const [selectedType, setSelectedType] = useState<ParallelismType>(parallelismTypes[0])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Types of Parallelism in Distributed Training
          </h2>
          <p className="text-gray-600 text-lg">
            Understanding different strategies for scaling deep learning training across multiple GPUs
          </p>
        </div>

        {/* Parallelism Type Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {parallelismTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`
                  px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm
                  ${
                    selectedType.id === type.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                `}
              >
                <div className="font-bold">{type.shortName}</div>
                <div className="text-xs mt-1">{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Type Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedType.name} ({selectedType.shortName})
              </h3>
              <p className="text-gray-700 leading-relaxed">{selectedType.description}</p>
            </div>

            {/* Visualization */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border-2 border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Visualization
              </h4>
              <ParallelismVisualization type={selectedType.visualization} />
            </div>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500">
                <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Advantages
                </h4>
                <ul className="space-y-2">
                  {selectedType.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-5 border-l-4 border-red-500">
                <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Limitations
                </h4>
                <ul className="space-y-2">
                  {selectedType.cons.map((con, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-1">✗</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Use Cases and Frameworks */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Use Cases
                </h4>
                <ul className="space-y-2">
                  {selectedType.useCases.map((useCase, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-5 border-l-4 border-purple-500">
                <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Frameworks & Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedType.frameworks.map((framework, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {framework}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <ComparisonTable selectedType={selectedType} allTypes={parallelismTypes} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Visualization Component
function ParallelismVisualization({ type }: { type: string }) {
  const numGpus = 4

  switch (type) {
    case 'data':
      return <DataParallelismViz numGpus={numGpus} />
    case 'model':
      return <ModelParallelismViz numGpus={numGpus} />
    case 'pipeline':
      return <PipelineParallelismViz numGpus={numGpus} />
    case 'tensor':
      return <TensorParallelismViz numGpus={numGpus} />
    case 'sequence':
      return <SequenceParallelismViz numGpus={numGpus} />
    case 'expert':
      return <ExpertParallelismViz numGpus={numGpus} />
    default:
      return null
  }
}

// Data Parallelism Visualization
function DataParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Each GPU has full model, processes different data batches</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: numGpus }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-md"
          >
            <div className="text-center font-bold text-blue-600 mb-3">GPU {idx}</div>
            <div className="bg-blue-100 rounded p-2 mb-2 text-xs text-center font-semibold">
              Full Model
            </div>
            <div className="bg-green-100 rounded p-2 text-xs text-center">
              Batch {idx + 1}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="text-xs text-gray-600 text-center">Gradients</div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-center text-xs font-semibold text-purple-600 mt-1"
              >
                All-Reduce
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> After forward/backward pass, gradients are synchronized across all GPUs using All-Reduce operation.
        </p>
      </div>
    </div>
  )
}

// Model Parallelism Visualization
function ModelParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Model split across GPUs, data flows sequentially</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: numGpus }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-md w-32"
            >
              <div className="text-center font-bold text-purple-600 mb-2">GPU {idx}</div>
              <div className="bg-purple-100 rounded p-2 text-xs text-center font-semibold mb-2">
                Layers {idx * 25}% - {(idx + 1) * 25}%
              </div>
              <div className="bg-green-100 rounded p-2 text-xs text-center">
                Full Batch
              </div>
            </motion.div>
            {idx < numGpus - 1 && (
              <motion.div
                animate={{
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mt-2"
              >
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> Data flows sequentially through GPUs. Each GPU processes the full batch but only for its assigned layers.
        </p>
      </div>
    </div>
  )
}

// Pipeline Parallelism Visualization
function PipelineParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Model split across GPUs, micro-batches processed in parallel</p>
      </div>
      <div className="space-y-3">
        {['Micro-batch 1', 'Micro-batch 2', 'Micro-batch 3'].map((batch, batchIdx) => (
          <div key={batchIdx} className="flex items-center gap-2">
            <div className="w-24 text-xs font-semibold text-gray-600">{batch}</div>
            <div className="flex-1 flex items-center gap-2">
              {Array.from({ length: numGpus }).map((_, gpuIdx) => {
                const stage = (batchIdx + gpuIdx) % 3
                return (
                  <motion.div
                    key={gpuIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: stage === 0 ? 1 : stage === 1 ? 0.6 : 0.3 }}
                    transition={{ delay: gpuIdx * 0.1 }}
                    className="flex-1 bg-white rounded p-3 border-2 border-indigo-300 shadow-sm"
                  >
                    <div className="text-center text-xs font-bold text-indigo-600">GPU {gpuIdx}</div>
                    <div className="text-center text-xs mt-1">
                      {stage === 0 ? '🔄 Processing' : stage === 1 ? '⏳ Waiting' : '✓ Done'}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> Different micro-batches are processed simultaneously across the pipeline. GPUs work on different stages concurrently, improving utilization.
        </p>
      </div>
    </div>
  )
}

// Tensor Parallelism Visualization
function TensorParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Matrix operations split across GPUs (e.g., attention heads)</p>
      </div>
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <div className="text-center text-sm font-semibold text-gray-700 mb-3">Attention Layer</div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: numGpus }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded p-3 border-2 border-orange-300 shadow-sm"
            >
              <div className="text-center text-xs font-bold text-orange-600">GPU {idx}</div>
              <div className="text-center text-xs mt-1 text-gray-600">Head {idx + 1}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> Each GPU computes part of the matrix multiplication. For attention, each GPU handles different attention heads. Communication happens within each layer.
        </p>
      </div>
    </div>
  )
}

// Sequence Parallelism Visualization
function SequenceParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Sequence length split across GPUs</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: numGpus }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-4 border-2 border-teal-300 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-teal-600">GPU {idx}</div>
              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, tokenIdx) => (
                  <div
                    key={tokenIdx}
                    className="w-6 h-6 bg-teal-100 rounded text-xs flex items-center justify-center font-semibold"
                  >
                    {idx * 8 + tokenIdx + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              Tokens {idx * 8 + 1} - {(idx + 1) * 8}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> Each GPU processes a chunk of the sequence. Reduces activation memory per GPU and enables longer sequences.
        </p>
      </div>
    </div>
  )
}

// Expert Parallelism Visualization
function ExpertParallelismViz({ numGpus }: { numGpus: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Different experts (MoE) placed on different GPUs</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: numGpus }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-4 border-2 border-pink-300 shadow-md"
          >
            <div className="text-center font-bold text-pink-600 mb-3">GPU {idx}</div>
            <div className="space-y-2">
              <div className="bg-pink-100 rounded p-2 text-xs text-center font-semibold">
                Expert {idx * 2 + 1}
              </div>
              <div className="bg-pink-100 rounded p-2 text-xs text-center font-semibold">
                Expert {idx * 2 + 2}
              </div>
            </div>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mt-3 pt-3 border-t border-gray-300"
            >
              <div className="text-xs text-center text-gray-600">Tokens routed</div>
              <div className="text-xs text-center font-semibold text-pink-600 mt-1">→</div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Key:</span> Tokens are routed to appropriate experts based on routing logic. Only active experts process tokens, enabling sparse activation.
        </p>
      </div>
    </div>
  )
}

// Comparison Table Component
function ComparisonTable({ selectedType, allTypes }: { selectedType: ParallelismType; allTypes: ParallelismType[] }) {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Comparison with Other Parallelism Types
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Feature</th>
              {allTypes.map((type) => (
                <th
                  key={type.id}
                  className={`px-4 py-3 text-center font-semibold ${
                    type.id === selectedType.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {type.shortName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-700">Communication Frequency</td>
              <td className="px-4 py-3 text-center text-gray-600">Every iteration</td>
              <td className="px-4 py-3 text-center text-gray-600">Every layer</td>
              <td className="px-4 py-3 text-center text-gray-600">Every micro-batch</td>
              <td className="px-4 py-3 text-center text-gray-600">Every layer</td>
              <td className="px-4 py-3 text-center text-gray-600">Every layer</td>
              <td className="px-4 py-3 text-center text-gray-600">Per token</td>
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-700">Memory per GPU</td>
              <td className="px-4 py-3 text-center text-gray-600">Full model</td>
              <td className="px-4 py-3 text-center text-gray-600">Model/N</td>
              <td className="px-4 py-3 text-center text-gray-600">Model/N</td>
              <td className="px-4 py-3 text-center text-gray-600">Model/N</td>
              <td className="px-4 py-3 text-center text-gray-600">Model/N</td>
              <td className="px-4 py-3 text-center text-gray-600">Experts/N</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-700">GPU Utilization</td>
              <td className="px-4 py-3 text-center text-green-600 font-semibold">High</td>
              <td className="px-4 py-3 text-center text-yellow-600 font-semibold">Low</td>
              <td className="px-4 py-3 text-center text-green-600 font-semibold">Medium-High</td>
              <td className="px-4 py-3 text-center text-green-600 font-semibold">High</td>
              <td className="px-4 py-3 text-center text-green-600 font-semibold">High</td>
              <td className="px-4 py-3 text-center text-yellow-600 font-semibold">Variable</td>
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-700">Scalability</td>
              <td className="px-4 py-3 text-center text-gray-600">Limited by model size</td>
              <td className="px-4 py-3 text-center text-gray-600">Limited by layers</td>
              <td className="px-4 py-3 text-center text-gray-600">Very high</td>
              <td className="px-4 py-3 text-center text-gray-600">High</td>
              <td className="px-4 py-3 text-center text-gray-600">High</td>
              <td className="px-4 py-3 text-center text-gray-600">Very high</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-gray-700">Best For</td>
              <td className="px-4 py-3 text-center text-gray-600">Small-medium models</td>
              <td className="px-4 py-3 text-center text-gray-600">Large models (legacy)</td>
              <td className="px-4 py-3 text-center text-gray-600">Very large models</td>
              <td className="px-4 py-3 text-center text-gray-600">Transformer layers</td>
              <td className="px-4 py-3 text-center text-gray-600">Long sequences</td>
              <td className="px-4 py-3 text-center text-gray-600">MoE models</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

