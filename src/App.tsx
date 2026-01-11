import MatrixFlopsCalculator from './components/MatrixFlopsCalculator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            FLOPs Master
          </h1>
          <p className="text-xl text-gray-600">
            Matrix Multiplication FLOPs Calculator
          </p>
        </header>
        <MatrixFlopsCalculator />
      </div>
    </div>
  )
}

export default App

