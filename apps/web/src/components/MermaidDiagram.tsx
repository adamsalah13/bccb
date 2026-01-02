import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
})

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!elementRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // Clear previous content
        elementRef.current.innerHTML = ''

        // Generate unique ID for the diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the mermaid diagram
        const { svg } = await mermaid.render(id, chart)
        
        if (elementRef.current) {
          elementRef.current.innerHTML = svg
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error rendering mermaid diagram:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [chart])

  return (
    <div className={`mermaid-diagram ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error rendering diagram</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div ref={elementRef} className={isLoading || error ? 'hidden' : ''} />
    </div>
  )
}
