import { useState } from 'react'
import MermaidDiagram from '../components/MermaidDiagram'

interface Credential {
  id: string
  title: string
  description: string
  credits: number
  institution: string
  status: 'available' | 'in-progress' | 'completed'
  prerequisites?: string[]
}

export default function Credentials() {
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)

  // Sample credentials data
  const credentials: Credential[] = [
    {
      id: '1',
      title: 'Frontend Web Development Fundamentals',
      description: 'Learn HTML, CSS, JavaScript, and React to build modern web applications',
      credits: 3,
      institution: 'University of British Columbia',
      status: 'available',
      prerequisites: [],
    },
    {
      id: '2',
      title: 'Backend Development with Node.js',
      description: 'Master server-side development with Node.js, Express, and databases',
      credits: 3,
      institution: 'Simon Fraser University',
      status: 'available',
      prerequisites: ['Frontend Web Development Fundamentals'],
    },
    {
      id: '3',
      title: 'Data Science with Python',
      description: 'Introduction to data analysis, visualization, and machine learning',
      credits: 4,
      institution: 'University of Victoria',
      status: 'in-progress',
      prerequisites: [],
    },
    {
      id: '4',
      title: 'Cloud Computing Essentials',
      description: 'Learn AWS, Azure, and cloud architecture patterns',
      credits: 3,
      institution: 'British Columbia Institute of Technology',
      status: 'completed',
      prerequisites: ['Backend Development with Node.js'],
    },
    {
      id: '5',
      title: 'Machine Learning Fundamentals',
      description: 'Understanding ML algorithms, model training, and deployment',
      credits: 4,
      institution: 'University of British Columbia',
      status: 'available',
      prerequisites: ['Data Science with Python'],
    },
  ]

  // Create a dependency diagram for the selected credential
  const getDependencyDiagram = (credential: Credential) => {
    if (!credential.prerequisites || credential.prerequisites.length === 0) {
      return `
graph LR
    A[${credential.title}] --> B[Complete]
    style A fill:#0ea5e9,stroke:#0284c7,color:#fff
      `
    }

    const prereqNodes = credential.prerequisites
      .map((prereq, index) => `P${index}[${prereq}]`)
      .join('\n    ')
    const prereqEdges = credential.prerequisites
      .map((_, index) => `P${index} --> C[${credential.title}]`)
      .join('\n    ')

    return `
graph TD
    ${prereqNodes}
    ${prereqEdges}
    C --> D[Complete]
    style C fill:#0ea5e9,stroke:#0284c7,color:#fff
    `
  }

  const getStatusBadge = (status: 'available' | 'in-progress' | 'completed') => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
    }
    const labels = {
      available: 'Available',
      'in-progress': 'In Progress',
      completed: 'Completed',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Available Micro-Credentials
        </h1>
        <p className="mt-2 text-gray-600">
          Browse and select credentials to build your personalized learning pathway
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credentials List */}
        <div className="space-y-4">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
                selectedCredential?.id === credential.id
                  ? 'ring-2 ring-primary-500'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedCredential(credential)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {credential.title}
                </h3>
                {getStatusBadge(credential.status)}
              </div>
              <p className="text-gray-600 mb-3">{credential.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {credential.institution}
                </span>
                <span className="font-semibold">{credential.credits} Credits</span>
              </div>
              {credential.prerequisites && credential.prerequisites.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                  <div className="flex flex-wrap gap-1">
                    {credential.prerequisites.map((prereq, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Details Panel */}
        <div className="lg:sticky lg:top-8 h-fit">
          {selectedCredential ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Credential Details
              </h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedCredential.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedCredential.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Institution:</span>
                    <span className="font-medium">{selectedCredential.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credits:</span>
                    <span className="font-medium">{selectedCredential.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(selectedCredential.status)}
                  </div>
                </div>
              </div>

              {/* Pathway Diagram */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Learning Pathway
                </h3>
                <MermaidDiagram
                  chart={getDependencyDiagram(selectedCredential)}
                  className="bg-gray-50 p-4 rounded"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedCredential.status === 'available' && (
                  <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    Enroll Now
                  </button>
                )}
                {selectedCredential.status === 'in-progress' && (
                  <button className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors">
                    Continue Learning
                  </button>
                )}
                {selectedCredential.status === 'completed' && (
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    View Certificate
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">
                Select a credential to view details and pathway information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
