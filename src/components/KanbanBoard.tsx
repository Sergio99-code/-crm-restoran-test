import { useState } from 'react'
import { STAGES, type Deal, type Stage } from '../types/deal'

interface KanbanBoardProps {
  deals: Deal[]
  onMove: (dealId: string, newStage: Stage) => void
}

function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export default function KanbanBoard({ deals, onMove }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)

  const grouped: Record<Stage, Deal[]> = Object.fromEntries(
    STAGES.map((s) => [s.key, [] as Deal[]]),
  ) as Record<Stage, Deal[]>

  for (const deal of deals) {
    if (grouped[deal.stage]) {
      grouped[deal.stage].push(deal)
    }
  }

  function handleDrop(newStage: Stage) {
    setOverStage(null)
    if (draggedId) {
      onMove(draggedId, newStage)
    }
    setDraggedId(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const isDragOver = overStage === stage.key
        return (
          <div
            key={stage.key}
            onDragOver={(e) => {
              e.preventDefault()
              setOverStage(stage.key)
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(stage.key)
            }}
            className={`w-64 shrink-0 rounded-lg p-3 flex flex-col max-h-[70vh] border-2 transition-colors ${
              isDragOver
                ? 'bg-gray-200 border-gray-400'
                : 'bg-gray-100 border-transparent'
            }`}
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
              {stage.label}
              <span className="ml-2 text-gray-400 font-normal">
                {grouped[stage.key].length}
              </span>
            </h3>

            <div className="flex flex-col gap-3 overflow-y-auto flex-1">
              {grouped[stage.key].map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedId(deal.id)
                    e.dataTransfer.setData('text/plain', deal.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDraggedId(null)
                    setOverStage(null)
                  }}
                  className={`bg-white rounded-md border p-3 shadow-sm cursor-grab active:cursor-grabbing ${
                    draggedId === deal.id
                      ? 'opacity-40 border-blue-400'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{deal.client}</p>
                  {deal.company && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {deal.company}
                    </p>
                  )}
                  {deal.amount !== null && (
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {formatAmount(deal.amount)} ₽
                    </p>
                  )}
                </div>
              ))}

              {grouped[stage.key].length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Нет сделок
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
