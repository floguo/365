import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreVertical } from "lucide-react"
import { type MemoryCardProps } from './types'

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

export function MemoryCard({ 
  memory,
  isEditing,
  onEdit,
  onDelete,
  onClose,
  onEditStart,
  onEditCancel
}: MemoryCardProps) {
  const [editedMemory, setEditedMemory] = useState(memory)

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

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scaleY: 0, transformOrigin: "top" }}
      animate={{ 
        opacity: 1, 
        scaleY: 1,
        transition: {
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      exit={{ 
        opacity: 0, 
        scaleY: 0,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative"
    >
      <div className="absolute top-4 right-4">
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

      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="polaroid mb-6">
              {editedMemory.photo ? (
                <img src={editedMemory.photo} alt="Memory" className="w-full h-auto rounded-sm" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-sm">
                  No photo
                </div>
              )}
              <div className="caption mt-2">
                <span className="text-sm">{editedMemory.description}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3">
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
  )
}

function EditForm({ memory, onChange, onSave, onCancel, onPhotoUpload }: EditFormProps) {
  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
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
          onChange={(e) => onChange({ ...memory, date: new Date(e.target.value) })}
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
        <Input
          id="edit-photo"
          type="file"
          accept="image/*"
          onChange={onPhotoUpload}
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
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