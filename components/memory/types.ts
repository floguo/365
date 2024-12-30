// Types and interfaces
export type Memory = {
  id: string
  date: Date
  description: string
  journalEntry?: string
  intensity: 1 | 2 | 3 | 4
  photo?: string
  frameStyle?: PhotoFrameStyle
  photoEffect?: PhotoEffect
}

export interface MemoryGridProps {
  memories: Memory[]
  grid: (Date | null)[][]
  monthLabels: (string | null)[]
  weekdays: string[]
  graphWidth: number
  onSelectMemory: (memory: Memory | null) => void
}

export interface MemoryCardProps {
  memory: Memory
  isEditing: boolean
  onEdit: (memory: Memory) => void
  onDelete: () => void
  onClose: () => void
  onEditStart: () => void
  onEditCancel: () => void
  onPrev?: () => void
  onNext?: () => void
  currentIndex: number
  totalCount: number
  memories: Memory[]
  onSelectMemory: (memory: Memory) => void
}

export interface AddMemoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (memory: Omit<Memory, "id">) => void
}

export const intensityColors = {
  0: 'bg-[#ebedf0] dark:bg-gray-800',
  1: 'bg-emerald-100 dark:bg-emerald-900/30',
  2: 'bg-emerald-200 dark:bg-emerald-900/50',
  3: 'bg-emerald-300 dark:bg-emerald-900/70',
  4: 'bg-emerald-400 dark:bg-emerald-900/90'
} as const

// Add other type definitions 