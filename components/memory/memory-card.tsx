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
import { PhotoEffect, PhotoFrame, PhotoFrameStyle } from './photo-frame'

interface EditFormProps {
  memory: Memory
  onChange: (memory: Memory) => void
  onSave: () => void
  onCancel: () => void
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
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
    .sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex flex-col gap-1">
        {dayMemories.map((memory) => (
          <motion.button
            key={memory.id}
            onClick={() => onSelectMemory(memory)}
            className={`px-2 py-1 text-sm rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${memory.id === selectedId ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {memory.description}
          </motion.button>
        ))}
      </div>
    </div>
  )
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedMemory(prev => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragEnd = (event: any, info: any) => {
    const DRAG_THRESHOLD = 50
    if (info.offset.x > DRAG_THRESHOLD && onNext) {
      setDragDirection('right')
      onNext()
    } else if (info.offset.x < -DRAG_THRESHOLD && onPrev) {
      setDragDirection('left')
      onPrev()
    }
  }

  return (
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
        drag="x"
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        dragDirectionLock
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
        <DateMemories
          date={memory.date}
          memories={memories}
          onSelect={m => onSelectMemory(m)}
          selectedId={memory.id}
          onSelectMemory={onSelectMemory}
        />

        <div className="absolute top-4 right-4 z-10">
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

        <div className="absolute inset-0 pointer-events-none z-20">
          {!isEditing && (
            <>
              <div className="h-full flex items-center justify-between">
                <div className="pointer-events-auto pl-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-20"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPrev ? onPrev() : setEditedMemory(memories[memories.length - 1])}
                      className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                <div className="pointer-events-auto pr-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-20"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onNext ? onNext() : setEditedMemory(memories[0])}
                      className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 dark:bg-gray-800/10 backdrop-blur text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} of {totalCount}
              </div>
            </>
          )}
        </div>

        <div className="p-8 pt-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <PhotoFrame
                src={memory.photo}
                alt={memory.description}
                caption={memory.description}
                style={memory.frameStyle || "polaroid"}
                effect={memory.photoEffect || "none"}
                className="mb-6 max-w-full"
              />
            </div>

            <div className="w-full md:w-2/3 min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                {isEditing ? (
                  <EditForm 
                    memory={editedMemory}
                    onChange={setEditedMemory}
                    onSave={() => onEdit(editedMemory)}
                    onCancel={onEditCancel}
                    onPhotoUpload={handlePhotoUpload}
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

function EditForm({ memory, onChange, onSave, onCancel, onPhotoUpload }: EditFormProps) {
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
        <Input
          id="edit-date"
          type="date"
          value={format(memory.date, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="col-span-3"
        />
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
        <Label htmlFor="edit-journalEntry" className="text-right mt-2">
          Journal Entry
        </Label>
        <Textarea
          id="edit-journalEntry"
          value={memory.journalEntry}
          onChange={(e) => onChange({ ...memory, journalEntry: e.target.value })}
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

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-photo" className="text-right">
          Photo
        </Label>
        <div className="col-span-3 flex items-center gap-2">
          <Button 
            type="button"
            variant="outline"
            className="w-[120px]"
            onClick={() => document.getElementById('edit-photo')?.click()}
          >
            Choose File
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {memory.photo ? getFileNameFromPath(memory.photo) : 'No file chosen'}
          </span>
          <Input
            id="edit-photo"
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-frame-style" className="text-right">
          Frame Style
        </Label>
        <select
          id="edit-frame-style"
          value={memory.frameStyle || 'polaroid'}
          onChange={(e) => onChange({ ...memory, frameStyle: e.target.value as PhotoFrameStyle })}
          className="col-span-3 form-select"
        >
          <option value="polaroid">Polaroid</option>
          <option value="vintage">Vintage</option>
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
        </select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-photo-effect" className="text-right">
          Photo Effect
        </Label>
        <select
          id="edit-photo-effect"
          value={memory.photoEffect || 'none'}
          onChange={(e) => onChange({ ...memory, photoEffect: e.target.value as PhotoEffect })}
          className="col-span-3 form-select"
        >
          <option value="none">None</option>
          <option value="snow">Snow</option>
          <option value="christmas">Christmas Lights</option>
          <option value="sparkles">Sparkles</option>
        </select>
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
      className="prose dark:prose-invert max-w-none"
    >
      <h2 className="text-2xl font-semibold mb-4">
        {format(memory.date, 'MMMM d, yyyy')}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {memory.journalEntry || 'No journal entry for this memory.'}
      </p>
    </motion.div>
  )
}

function getFileNameFromPath(path: string | undefined) {
  if (!path) return ''
  // If it's a base64 string (newly uploaded photo)
  if (path.startsWith('data:')) {
    return 'Selected photo'
  }
  // If it's a URL (existing photo)
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return 'Current photo'
  }
  // For regular file paths
  return path.split('/').pop()?.split('\\').pop() || ''
} 