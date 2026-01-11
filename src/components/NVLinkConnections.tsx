import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface NVLinkConnectionsProps {
  processes: Array<{ id: number }>
  operation: 'all-reduce' | 'all-gather' | 'gather' | 'scatter' | 'broadcast' | 'reduce'
  isPlaying: boolean
  currentStep: number
}

export default function NVLinkConnections({
  processes,
  operation,
  isPlaying,
  currentStep,
}: NVLinkConnectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const connectionsRef = useRef<Array<{ from: number; to: number | string; active: boolean }>>([])

  useEffect(() => {
    const updateConnections = () => {
      const connections: Array<{ from: number; to: number | string; active: boolean }> = []

      switch (operation) {
        case 'all-reduce':
          // Phase 1: All to center
          if (currentStep < processes.length * 9) {
            processes.forEach((p) => {
              connections.push({ from: p.id, to: 'center', active: isPlaying && currentStep >= p.id * 3 })
            })
          }
          // Phase 2: Center to all
          else {
            const receiveStep = currentStep - processes.length * 9
            processes.forEach((p) => {
              connections.push({
                from: 'center' as any,
                to: p.id,
                active: isPlaying && receiveStep >= p.id * 3,
              })
            })
          }
          break

        case 'all-gather':
          processes.forEach((from) => {
            processes.forEach((to) => {
              if (from.id !== to.id) {
                connections.push({
                  from: from.id,
                  to: to.id,
                  active: isPlaying && currentStep >= (from.id * processes.length + to.id) * 3,
                })
              }
            })
          })
          break

        case 'gather':
          processes.forEach((p) => {
            if (p.id !== 0) {
              connections.push({
                from: p.id,
                to: 0,
                active: isPlaying && currentStep >= p.id * 3,
              })
            }
          })
          break

        case 'scatter':
          processes.forEach((p) => {
            connections.push({
              from: 0,
              to: p.id,
              active: isPlaying && currentStep >= p.id * 3,
            })
          })
          break

        case 'broadcast':
          processes.slice(1).forEach((p) => {
            connections.push({
              from: 0,
              to: p.id,
              active: isPlaying && currentStep >= (p.id - 1) * 3,
            })
          })
          break

        case 'reduce':
          processes.forEach((p) => {
            if (p.id !== 0) {
              connections.push({
                from: p.id,
                to: 0,
                active: isPlaying && currentStep >= p.id * 3,
              })
            }
          })
          break
      }

      connectionsRef.current = connections
    }

    updateConnections()
  }, [processes, operation, isPlaying, currentStep])

  const getConnectionLine = (from: number | string, to: number | string) => {
    if (!containerRef.current) return null

    const fromEl =
      from === 'center'
        ? document.querySelector('[data-process-id="center"]')
        : document.querySelector(`[data-process-id="${from}"]`)
    const toEl = document.querySelector(`[data-process-id="${to}"]`)

    if (!fromEl || !toEl) return null

    const fromRect = fromEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top
    const toX = toRect.left + toRect.width / 2 - containerRect.left
    const toY = toRect.top + toRect.height / 2 - containerRect.top

    const dx = toX - fromX
    const dy = toY - fromY
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    const connection = connectionsRef.current.find(
      (c) => String(c.from) === String(from) && String(c.to) === String(to)
    )

    return {
      x: fromX,
      y: fromY,
      length,
      angle,
      active: connection?.active || false,
    }
  }

  const allConnections: Array<{ from: number | string; to: number | string }> = []
  
  switch (operation) {
    case 'all-reduce':
      processes.forEach((p) => {
        allConnections.push({ from: p.id, to: 'center' })
        allConnections.push({ from: 'center', to: p.id })
      })
      break
    case 'all-gather':
      processes.forEach((from) => {
        processes.forEach((to) => {
          if (from.id !== to.id) {
            allConnections.push({ from: from.id, to: to.id })
          }
        })
      })
      break
    case 'gather':
      processes.forEach((p) => {
        if (p.id !== 0) allConnections.push({ from: p.id, to: 0 })
      })
      break
    case 'scatter':
      processes.forEach((p) => {
        allConnections.push({ from: 0, to: p.id })
      })
      break
    case 'broadcast':
      processes.slice(1).forEach((p) => {
        allConnections.push({ from: 0, to: p.id })
      })
      break
    case 'reduce':
      processes.forEach((p) => {
        if (p.id !== 0) allConnections.push({ from: p.id, to: 0 })
      })
      break
  }

  return (
    <div ref={containerRef} className="nvlink-container">
      {allConnections.map((conn, idx) => {
        const lineData = getConnectionLine(conn.from, conn.to)
        if (!lineData) return null

        const connection = connectionsRef.current.find(
          (c) => String(c.from) === String(conn.from) && String(c.to) === String(conn.to)
        )

        return (
          <motion.div
            key={`${conn.from}-${conn.to}-${idx}`}
            className={`nvlink-line ${connection?.active ? 'active flowing' : ''} ${
              operation === 'all-reduce' && (String(conn.to) === 'center' ? 'to-center' : 'from-center')
            }`}
            style={{
              left: `${lineData.x}px`,
              top: `${lineData.y}px`,
              width: `${lineData.length}px`,
              transform: `rotate(${lineData.angle}deg)`,
              opacity: connection?.active ? 1 : 0.2,
            }}
            initial={{ opacity: 0.2, scaleX: 0 }}
            animate={{
              opacity: connection?.active ? 1 : 0.2,
              scaleX: connection?.active ? 1 : 0.3,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {connection?.active && (
              <motion.div
                className="nvlink-label"
                style={{
                  left: '50%',
                  top: '-10px',
                }}
                initial={{ opacity: 0, scale: 0.5, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-xs">NVLink</span>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

