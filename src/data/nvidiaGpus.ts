export interface NvidiaGpu {
  name: string
  series: string
  architecture: string
  tflops: number // Theoretical peak performance in TFLOPS (FP32)
  memory?: string
  releaseYear?: number
}

export const nvidiaGpus: NvidiaGpu[] = [
  // Datacenter GPUs - Hopper Architecture
  { name: 'H100 PCIe', series: 'Hopper', architecture: 'Hopper', tflops: 67, memory: '80GB', releaseYear: 2022 },
  { name: 'H100 SXM', series: 'Hopper', architecture: 'Hopper', tflops: 67, memory: '80GB', releaseYear: 2022 },
  { name: 'H100 NVL', series: 'Hopper', architecture: 'Hopper', tflops: 1000, memory: '188GB', releaseYear: 2023 },

  // Datacenter GPUs - Ampere Architecture
  { name: 'A100 PCIe 40GB', series: 'Ampere', architecture: 'Ampere', tflops: 19.5, memory: '40GB', releaseYear: 2020 },
  { name: 'A100 PCIe 80GB', series: 'Ampere', architecture: 'Ampere', tflops: 19.5, memory: '80GB', releaseYear: 2020 },
  { name: 'A100 SXM 40GB', series: 'Ampere', architecture: 'Ampere', tflops: 19.5, memory: '40GB', releaseYear: 2020 },
  { name: 'A100 SXM 80GB', series: 'Ampere', architecture: 'Ampere', tflops: 19.5, memory: '80GB', releaseYear: 2020 },

  // Datacenter GPUs - Ada Lovelace Architecture
  { name: 'L40', series: 'Ada Lovelace', architecture: 'Ada Lovelace', tflops: 48.7, memory: '48GB', releaseYear: 2022 },
  { name: 'L40S', series: 'Ada Lovelace', architecture: 'Ada Lovelace', tflops: 91.6, memory: '48GB', releaseYear: 2023 },
  { name: 'L4', series: 'Ada Lovelace', architecture: 'Ada Lovelace', tflops: 30.3, memory: '24GB', releaseYear: 2022 },

  // Datacenter GPUs - Volta Architecture
  { name: 'V100 PCIe 16GB', series: 'Volta', architecture: 'Volta', tflops: 15.7, memory: '16GB', releaseYear: 2017 },
  { name: 'V100 PCIe 32GB', series: 'Volta', architecture: 'Volta', tflops: 15.7, memory: '32GB', releaseYear: 2017 },
  { name: 'V100 SXM 16GB', series: 'Volta', architecture: 'Volta', tflops: 15.7, memory: '16GB', releaseYear: 2017 },
  { name: 'V100 SXM 32GB', series: 'Volta', architecture: 'Volta', tflops: 15.7, memory: '32GB', releaseYear: 2017 },

  // Datacenter GPUs - Pascal Architecture
  { name: 'P100 PCIe', series: 'Pascal', architecture: 'Pascal', tflops: 9.3, memory: '16GB', releaseYear: 2016 },
  { name: 'P100 SXM', series: 'Pascal', architecture: 'Pascal', tflops: 10.6, memory: '16GB', releaseYear: 2016 },

  // GeForce RTX 40 Series - Ada Lovelace
  { name: 'RTX 4090', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 83, memory: '24GB', releaseYear: 2022 },
  { name: 'RTX 4080', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 48.7, memory: '16GB', releaseYear: 2022 },
  { name: 'RTX 4070 Ti', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 40.1, memory: '12GB', releaseYear: 2023 },
  { name: 'RTX 4070', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 29.1, memory: '12GB', releaseYear: 2023 },
  { name: 'RTX 4060 Ti 16GB', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 22.1, memory: '16GB', releaseYear: 2023 },
  { name: 'RTX 4060 Ti 8GB', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 22.1, memory: '8GB', releaseYear: 2023 },
  { name: 'RTX 4060', series: 'GeForce RTX 40', architecture: 'Ada Lovelace', tflops: 15.1, memory: '8GB', releaseYear: 2023 },

  // GeForce RTX 30 Series - Ampere
  { name: 'RTX 3090 Ti', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 40, memory: '24GB', releaseYear: 2022 },
  { name: 'RTX 3090', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 36, memory: '24GB', releaseYear: 2020 },
  { name: 'RTX 3080 Ti', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 34.1, memory: '12GB', releaseYear: 2021 },
  { name: 'RTX 3080 12GB', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 30.6, memory: '12GB', releaseYear: 2022 },
  { name: 'RTX 3080 10GB', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 29.8, memory: '10GB', releaseYear: 2020 },
  { name: 'RTX 3070 Ti', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 21.7, memory: '8GB', releaseYear: 2021 },
  { name: 'RTX 3070', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 20.3, memory: '8GB', releaseYear: 2020 },
  { name: 'RTX 3060 Ti', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 16.2, memory: '8GB', releaseYear: 2020 },
  { name: 'RTX 3060 12GB', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 12.7, memory: '12GB', releaseYear: 2021 },
  { name: 'RTX 3060 8GB', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 12.7, memory: '8GB', releaseYear: 2022 },
  { name: 'RTX 3050', series: 'GeForce RTX 30', architecture: 'Ampere', tflops: 9.1, memory: '8GB', releaseYear: 2022 },

  // GeForce RTX 20 Series - Turing
  { name: 'RTX 2080 Ti', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 13.4, memory: '11GB', releaseYear: 2018 },
  { name: 'RTX 2080 Super', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 11.1, memory: '8GB', releaseYear: 2019 },
  { name: 'RTX 2080', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 10.1, memory: '8GB', releaseYear: 2018 },
  { name: 'RTX 2070 Super', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 9.1, memory: '8GB', releaseYear: 2019 },
  { name: 'RTX 2070', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 7.9, memory: '8GB', releaseYear: 2018 },
  { name: 'RTX 2060 Super', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 7.2, memory: '8GB', releaseYear: 2019 },
  { name: 'RTX 2060', series: 'GeForce RTX 20', architecture: 'Turing', tflops: 6.5, memory: '6GB', releaseYear: 2019 },

  // GeForce GTX 16 Series - Turing
  { name: 'GTX 1660 Ti', series: 'GeForce GTX 16', architecture: 'Turing', tflops: 5.5, memory: '6GB', releaseYear: 2019 },
  { name: 'GTX 1660 Super', series: 'GeForce GTX 16', architecture: 'Turing', tflops: 5.0, memory: '6GB', releaseYear: 2019 },
  { name: 'GTX 1660', series: 'GeForce GTX 16', architecture: 'Turing', tflops: 4.6, memory: '6GB', releaseYear: 2019 },
  { name: 'GTX 1650 Super', series: 'GeForce GTX 16', architecture: 'Turing', tflops: 4.4, memory: '4GB', releaseYear: 2019 },
  { name: 'GTX 1650', series: 'GeForce GTX 16', architecture: 'Turing', tflops: 3.0, memory: '4GB', releaseYear: 2019 },

  // GeForce 10 Series - Pascal
  { name: 'GTX 1080 Ti', series: 'GeForce 10', architecture: 'Pascal', tflops: 11.3, memory: '11GB', releaseYear: 2017 },
  { name: 'GTX 1080', series: 'GeForce 10', architecture: 'Pascal', tflops: 8.9, memory: '8GB', releaseYear: 2016 },
  { name: 'GTX 1070 Ti', series: 'GeForce 10', architecture: 'Pascal', tflops: 8.2, memory: '8GB', releaseYear: 2017 },
  { name: 'GTX 1070', series: 'GeForce 10', architecture: 'Pascal', tflops: 6.5, memory: '8GB', releaseYear: 2016 },
  { name: 'GTX 1060 6GB', series: 'GeForce 10', architecture: 'Pascal', tflops: 4.4, memory: '6GB', releaseYear: 2016 },
  { name: 'GTX 1060 3GB', series: 'GeForce 10', architecture: 'Pascal', tflops: 3.9, memory: '3GB', releaseYear: 2016 },
  { name: 'GTX 1050 Ti', series: 'GeForce 10', architecture: 'Pascal', tflops: 2.1, memory: '4GB', releaseYear: 2016 },
  { name: 'GTX 1050', series: 'GeForce 10', architecture: 'Pascal', tflops: 1.8, memory: '2GB', releaseYear: 2016 },

  // Quadro RTX Series - Turing
  { name: 'Quadro RTX 8000', series: 'Quadro RTX', architecture: 'Turing', tflops: 16.3, memory: '48GB', releaseYear: 2018 },
  { name: 'Quadro RTX 6000', series: 'Quadro RTX', architecture: 'Turing', tflops: 16.3, memory: '24GB', releaseYear: 2018 },
  { name: 'Quadro RTX 5000', series: 'Quadro RTX', architecture: 'Turing', tflops: 11.2, memory: '16GB', releaseYear: 2018 },
  { name: 'Quadro RTX 4000', series: 'Quadro RTX', architecture: 'Turing', tflops: 7.1, memory: '8GB', releaseYear: 2018 },

  // Quadro RTX Series - Ampere
  { name: 'RTX A6000', series: 'Quadro RTX', architecture: 'Ampere', tflops: 38.7, memory: '48GB', releaseYear: 2020 },
  { name: 'RTX A5000', series: 'Quadro RTX', architecture: 'Ampere', tflops: 27.8, memory: '24GB', releaseYear: 2021 },
  { name: 'RTX A4000', series: 'Quadro RTX', architecture: 'Ampere', tflops: 19.2, memory: '16GB', releaseYear: 2021 },
  { name: 'RTX A2000', series: 'Quadro RTX', architecture: 'Ampere', tflops: 8.0, memory: '6GB', releaseYear: 2021 },

  // Quadro RTX Series - Ada Lovelace
  { name: 'RTX 6000 Ada', series: 'Quadro RTX', architecture: 'Ada Lovelace', tflops: 91.6, memory: '48GB', releaseYear: 2022 },
  { name: 'RTX 5000 Ada', series: 'Quadro RTX', architecture: 'Ada Lovelace', tflops: 30.3, memory: '32GB', releaseYear: 2022 },
  { name: 'RTX 4000 Ada', series: 'Quadro RTX', architecture: 'Ada Lovelace', tflops: 24.7, memory: '20GB', releaseYear: 2023 },
  { name: 'RTX 4000 SFF Ada', series: 'Quadro RTX', architecture: 'Ada Lovelace', tflops: 19.2, memory: '20GB', releaseYear: 2023 },

  // Quadro Series - Pascal
  { name: 'Quadro P6000', series: 'Quadro', architecture: 'Pascal', tflops: 12, memory: '24GB', releaseYear: 2016 },
  { name: 'Quadro P5000', series: 'Quadro', architecture: 'Pascal', tflops: 8.9, memory: '16GB', releaseYear: 2016 },
  { name: 'Quadro P4000', series: 'Quadro', architecture: 'Pascal', tflops: 5.3, memory: '8GB', releaseYear: 2016 },
  { name: 'Quadro P2000', series: 'Quadro', architecture: 'Pascal', tflops: 3.0, memory: '5GB', releaseYear: 2017 },
  { name: 'Quadro P1000', series: 'Quadro', architecture: 'Pascal', tflops: 1.9, memory: '4GB', releaseYear: 2017 },

  // Quadro Series - Volta
  { name: 'Quadro GV100', series: 'Quadro', architecture: 'Volta', tflops: 14.8, memory: '32GB', releaseYear: 2018 },

  // Tesla Series - Ampere
  { name: 'Tesla A100 40GB', series: 'Tesla', architecture: 'Ampere', tflops: 19.5, memory: '40GB', releaseYear: 2020 },
  { name: 'Tesla A100 80GB', series: 'Tesla', architecture: 'Ampere', tflops: 19.5, memory: '80GB', releaseYear: 2020 },

  // Tesla Series - Volta
  { name: 'Tesla V100 PCIe', series: 'Tesla', architecture: 'Volta', tflops: 15.7, memory: '32GB', releaseYear: 2017 },
  { name: 'Tesla V100 SXM', series: 'Tesla', architecture: 'Volta', tflops: 15.7, memory: '32GB', releaseYear: 2017 },

  // Tesla Series - Pascal
  { name: 'Tesla P100', series: 'Tesla', architecture: 'Pascal', tflops: 10.6, memory: '16GB', releaseYear: 2016 },
  { name: 'Tesla P40', series: 'Tesla', architecture: 'Pascal', tflops: 12, memory: '24GB', releaseYear: 2016 },
  { name: 'Tesla P4', series: 'Tesla', architecture: 'Pascal', tflops: 5.5, memory: '8GB', releaseYear: 2016 },

  // TITAN Series
  { name: 'TITAN RTX', series: 'TITAN', architecture: 'Turing', tflops: 16.3, memory: '24GB', releaseYear: 2018 },
  { name: 'TITAN V', series: 'TITAN', architecture: 'Volta', tflops: 15, memory: '12GB', releaseYear: 2017 },
  { name: 'TITAN Xp', series: 'TITAN', architecture: 'Pascal', tflops: 12.1, memory: '12GB', releaseYear: 2017 },
  { name: 'TITAN X (Pascal)', series: 'TITAN', architecture: 'Pascal', tflops: 10.97, memory: '12GB', releaseYear: 2016 },

  // GeForce 9 Series - Maxwell
  { name: 'GTX 980 Ti', series: 'GeForce 9', architecture: 'Maxwell', tflops: 5.6, memory: '6GB', releaseYear: 2015 },
  { name: 'GTX 980', series: 'GeForce 9', architecture: 'Maxwell', tflops: 4.6, memory: '4GB', releaseYear: 2014 },
  { name: 'GTX 970', series: 'GeForce 9', architecture: 'Maxwell', tflops: 3.5, memory: '4GB', releaseYear: 2014 },
  { name: 'GTX 960', series: 'GeForce 9', architecture: 'Maxwell', tflops: 2.3, memory: '2GB', releaseYear: 2015 },
  { name: 'GTX 950', series: 'GeForce 9', architecture: 'Maxwell', tflops: 1.8, memory: '2GB', releaseYear: 2015 },

  // Jetson Series (Edge AI)
  { name: 'Jetson AGX Orin', series: 'Jetson', architecture: 'Ampere', tflops: 5.3, memory: '32GB', releaseYear: 2022 },
  { name: 'Jetson AGX Xavier', series: 'Jetson', architecture: 'Volta', tflops: 1.4, memory: '32GB', releaseYear: 2018 },
  { name: 'Jetson Xavier NX', series: 'Jetson', architecture: 'Volta', tflops: 1.4, memory: '16GB', releaseYear: 2020 },
]

// Helper function to get GPUs grouped by series
export function getGpusBySeries(): Record<string, NvidiaGpu[]> {
  const grouped: Record<string, NvidiaGpu[]> = {}
  
  nvidiaGpus.forEach(gpu => {
    if (!grouped[gpu.series]) {
      grouped[gpu.series] = []
    }
    grouped[gpu.series].push(gpu)
  })
  
  // Sort GPUs within each series by TFLOPS (descending)
  Object.keys(grouped).forEach(series => {
    grouped[series].sort((a, b) => b.tflops - a.tflops)
  })
  
  return grouped
}

// Helper function to find GPU by name
export function findGpuByName(name: string): NvidiaGpu | undefined {
  return nvidiaGpus.find(gpu => gpu.name === name)
}

