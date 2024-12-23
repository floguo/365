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
  1: 'bg-[#9be9a8] dark:bg-emerald-900',
  2: 'bg-[#40c463] dark:bg-emerald-700',
  3: 'bg-[#30a14e] dark:bg-emerald-600',
  4: 'bg-[#216e39] dark:bg-emerald-500'
} as const

// Add other type definitions 