import MermaidDiagram from '../components/MermaidDiagram'

export default function Home() {
  // Example pathway diagram
  const pathwayDiagram = `
graph TD
    A[Start Learning] --> B[Choose Path]
    B --> C[Software Development]
    B --> D[Data Science]
    B --> E[Business Analytics]
    C --> F[Frontend Development]
    C --> G[Backend Development]
    D --> H[Machine Learning]
    D --> I[Data Engineering]
    E --> J[Financial Analysis]
    E --> K[Marketing Analytics]
    F --> L[Complete Credential]
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M[Get Certified]
  `

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          AI-Native Micro-Credentials Platform
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          BC Council on Admissions and Transfer - Empowering learners with
          flexible, stackable credentials powered by AI
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI-Powered Recommendations
          </h3>
          <p className="text-gray-600">
            Get personalized learning pathway recommendations based on your
            goals and experience
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Flexible Learning Paths
          </h3>
          <p className="text-gray-600">
            Stack credentials to build expertise in your field at your own pace
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-primary-600 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verified Credentials
          </h3>
          <p className="text-gray-600">
            Earn blockchain-verified credentials recognized across BC
            institutions
          </p>
        </div>
      </div>

      {/* Pathway Visualization */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Example Learning Pathway
        </h2>
        <div className="flex justify-center">
          <MermaidDiagram chart={pathwayDiagram} className="max-w-4xl" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <button className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors">
          Start Your Journey
        </button>
      </div>
    </div>
  )
}
