import { motion, AnimatePresence, usePresence, useDragControls } from 'framer-motion'
import { format, isSameDay } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Memory, type MemoryCardProps } from './types'
import { useState, useEffect, useRef } from 'react'
import DatePicker from "@/components/ui/date-picker"

interface EditFormProps {
  memory: Memory
  onChange: (memory: Memory) => void
  onSave: () => void
  onCancel: () => void
}

interface ViewModeProps {
  memory: Memory
}

function DateMemories({ 
  date, 
  memories, 
  onSelect, 
  selectedId,
  onSelectMemory 
}: {
  date: Date
  memories: Memory[]
  onSelect: (memory: Memory) => void
  selectedId: string
  onSelectMemory: (memory: Memory) => void
}) {
  const dayMemories = memories
    .filter(m => isSameDay(m.date, date))
}

export function MemoryCard({ 
  memories,
  memory,
  isEditing,
  onEdit,
  onDelete,
  onClose,
  onEditStart,
  onEditCancel,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
  onSelectMemory 
}: MemoryCardProps) {
  const [editedMemory, setEditedMemory] = useState(memory)
  const [isPresent, safeToRemove] = usePresence()
  const [height, setHeight] = useState<number | "auto">("auto")
  const contentRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    if (!isPresent) {
      const timeout = setTimeout(safeToRemove, 300)
      return () => clearTimeout(timeout)
    }
  }, [isPresent, safeToRemove])

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.offsetHeight)
    }
  }, [isEditing])

  return (
    // Animate the edit and delete buttons
    <motion.div
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: 1, 
        height,
        transition: {
          height: { 
            type: "spring",
            stiffness: 100,
            damping: 30,
            mass: 0.8
          },
          opacity: { 
            duration: 0.25
          }
        }
      }}
      exit={{ 
        opacity: 0,
        height: 0,
        transition: {
          height: { 
            duration: 0.35,
            ease: [0.32, 0, 0.67, 0]
          },
          opacity: {
            duration: 0.2
          }
        }
      }}
      className="mt-6 overflow-hidden"
    >
      <motion.div
        ref={contentRef}
        initial={false}
        animate={{ 
          x: 0,
          y: 0, 
          opacity: 1,
          scale: 1,
          transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            y: { type: "spring", stiffness: 100, damping: 20 },
            opacity: { duration: 0.25 }
          }
        }}
        exit={{
          x: dragDirection === 'left' ? -100 : dragDirection === 'right' ? 100 : 0,
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: [0.32, 0, 0.67, 0]
          }
        }}
        className="bg-white dark:bg-gray-800 rounded-lg relative"
      >

        {/* Edit and delete buttons */}
        <div className="absolute top-4 right-0 z-10">
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditStart}>
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your memory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="absolute inset-0 pointer-events-none">
          {!isEditing && (
            <>
              <div className="h-full absolute top-0 right-0 flex items-center gap-2">
                <div className="pointer-events-auto">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPrev ? onPrev() : setEditedMemory(memories[memories.length - 1])}
                      className="h-9 w-9 text-gray-400 rounded-sm border border-gray-100 dark:border-gray-700 bg-white/10 hover:bg-white/20 backdrop-blur"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                <div className="pointer-events-auto">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onNext ? onNext() : setEditedMemory(memories[0])}
                      className="h-9 w-9 text-gray-400 rounded-sm border border-gray-100 dark:border-gray-700 bg-white/10 hover:bg-white/20 backdrop-blur"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 dark:bg-gray-800/10 backdrop-blur text-sm text-gray-400 dark:text-gray-400">
                {currentIndex + 1} of {totalCount}
              </div>
            </>
          )}
        </div>

        {/* Journal entry content */}
        <div className="py-6 px-8 pb-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3">
              <AnimatePresence mode="wait" initial={false}>
                {isEditing ? (
                  <EditForm 
                    memory={editedMemory}
                    onChange={setEditedMemory}
                    onSave={() => onEdit(editedMemory)}
                    onCancel={onEditCancel}
                  />
                ) : (
                  <ViewMode memory={memory} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Edit form for memory
function EditForm({ memory, onChange, onSave, onCancel}: EditFormProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date()
    onChange({ ...memory, date })
  }

  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -10, 
        scale: 0.98,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }}
      className="grid gap-6"
    >
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-date" className="text-right">
          Date
        </Label>
        <div className="col-span-3">
          <DatePicker
            date={memory.date}
            onSelect={(date) => date && onChange({ ...memory, date })}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-description" className="text-right">
          Description
        </Label>
        <Input
          id="edit-description"
          value={memory.description}
          onChange={(e) => onChange({ ...memory, description: e.target.value })}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label
          htmlFor="edit-journalEntry"
          className="text-right self-start pr-2"
        >
        Journal Entry
        </Label>
        <Textarea
          id="edit-journalEntry"
          value={memory.journalEntry}
          onChange={(e) =>
            onChange({ ...memory, journalEntry: e.target.value })
          }
          className="col-span-3"
          rows={8}
              />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-intensity" className="text-right">
          Intensity
        </Label>
        <Input
          id="edit-intensity"
          type="number"
          min="1"
          max="4"
          value={memory.intensity}
          onChange={(e) => onChange({ ...memory, intensity: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
          className="col-span-3"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </motion.div>
  )
}

function ViewMode({ memory }: ViewModeProps) {
  return (
    <motion.div
      key="view"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.1,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -10, 
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: [0.4, 0, 1, 1]
        }
      }}
      className="prose dark:prose-invert max-w-none"
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {format(memory.date, 'MMMM d, yyyy')}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {memory.journalEntry || 'No journal entry for this memory.'}
      </p>
    </motion.div>
  )
} 