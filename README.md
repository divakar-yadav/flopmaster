# FLOPs Master

A modern React application for calculating Floating Point Operations (FLOPs) in matrix multiplication.

## Features

- **Interactive Matrix Dimension Input**: Enter dimensions for two matrices (A and B)
- **Real-time FLOPs Calculation**: Instantly see the total FLOPs, multiplications, and additions
- **NVIDIA GPU Selection**: Choose from comprehensive list of all NVIDIA GPU models
- **Execution Time Estimation**: Calculate estimated execution time based on selected GPU's peak performance
- **Visual Matrix Representation**: Clear visualization of the matrix multiplication operation
- **Formula Explanation**: Detailed breakdown of how FLOPs and execution time are calculated
- **Modern UI**: Beautiful, responsive design built with Tailwind CSS

## GPU Support

The tool includes all major NVIDIA GPU models organized by series:
- **Datacenter GPUs**: Hopper (H100), Ampere (A100), Ada Lovelace (L40, L40S, L4), Volta (V100), Pascal (P100)
- **GeForce RTX 40 Series**: RTX 4090, RTX 4080, RTX 4070 Ti, RTX 4070, RTX 4060 Ti, RTX 4060
- **GeForce RTX 30 Series**: RTX 3090 Ti, RTX 3090, RTX 3080 Ti, RTX 3080, RTX 3070 Ti, RTX 3070, RTX 3060 Ti, RTX 3060, RTX 3050
- **GeForce RTX 20 Series**: RTX 2080 Ti, RTX 2080 Super, RTX 2080, RTX 2070 Super, RTX 2070, RTX 2060 Super, RTX 2060
- **GeForce GTX 16 Series**: GTX 1660 Ti, GTX 1660 Super, GTX 1660, GTX 1650 Super, GTX 1650
- **GeForce 10 Series**: GTX 1080 Ti, GTX 1080, GTX 1070 Ti, GTX 1070, GTX 1060, GTX 1050 Ti, GTX 1050
- **Quadro RTX Series**: RTX 6000 Ada, RTX 5000 Ada, RTX 4000 Ada, RTX A6000, RTX A5000, RTX A4000, RTX A2000, RTX 8000, RTX 6000, RTX 5000, RTX 4000
- **Quadro Series**: P6000, P5000, P4000, P2000, P1000, GV100
- **Tesla Series**: A100, V100, P100, P40, P4
- **TITAN Series**: TITAN RTX, TITAN V, TITAN Xp, TITAN X
- **Jetson Series**: AGX Orin, AGX Xavier, Xavier NX

## Technology Stack

- **React 18**: Latest React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How It Works

### FLOPs Calculation

For matrix multiplication A[m × n] × B[n × p] = C[m × p]:

- **Multiplications**: m × p × n (one multiplication per element in the dot product for each output element)
- **Additions**: m × p × (n - 1) (one less addition than multiplications per output element)
- **Total FLOPs**: Multiplications + Additions = m × p × (2n - 1)

### Execution Time Calculation

The execution time is estimated based on the selected GPU's theoretical peak performance:

- **Time (seconds)**: Total FLOPs ÷ (GPU TFLOPS × 10¹²)
- The calculation assumes the GPU can achieve its theoretical peak performance
- Results are displayed in the most appropriate time unit (seconds, milliseconds, microseconds, or nanoseconds)

## License

MIT

