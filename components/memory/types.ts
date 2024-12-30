// Types and interfaces
export type Memory = {
  id: string
  date: Date
  description: string
  journalEntry?: string
  intensity: 1 | 2 | 3 | 4
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

export const intensityColors: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-gray-100 border border-gray-200/30',
  1: 'bg-green-200 border border-green-300/30',
  2: 'bg-green-500',
  3: 'bg-green-700',
  4: 'bg-green-900'
} as const

// Add other type definitions 