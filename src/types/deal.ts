export type Stage = 'lead' | 'working' | 'negotiation' | 'success' | 'lost'

export interface Deal {
  id: string
  client: string
  company: string
  contact: string
  amount: number
  note: string
  stage: Stage
  user_id: string
  created_at: string
}

export const STAGES: { key: Stage; label: string }[] = [
  { key: 'lead', label: 'Новый лид' },
  { key: 'working', label: 'В работе' },
  { key: 'negotiation', label: 'Переговоры' },
  { key: 'success', label: 'Успех' },
  { key: 'lost', label: 'Отказ' },
]

export const STAGE_LABEL: Record<Stage, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<Stage, string>
