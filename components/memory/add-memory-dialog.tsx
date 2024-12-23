import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import type { AddMemoryDialogProps, Memory } from './types'

export function AddMemoryDialog({
  isOpen,
  onOpenChange,
  onAdd
}: AddMemoryDialogProps) {
  const [newMemory, setNewMemory] = useState<Partial<Memory>>({
    date: new Date(),
    description: '',
    journalEntry: '',
    intensity: 1,
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewMemory(prev => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date()
    setNewMemory(prev => ({ ...prev, date }))
  }

  const handleAdd = () => {
    if (newMemory.date && newMemory.description && newMemory.intensity) {
      onAdd(newMemory as Omit<Memory, "id">)
      setNewMemory({
        date: new Date(),
        description: '',
        journalEntry: '',
        intensity: 1,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ 
            scale: 1.03,
            rotate: 0.5,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 10
            }
          }}
          whileTap={{ 
            scale: 0.97,
            rotate: -0.5
          }}
        >
          <Button variant="outline">Add Memory</Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a New Memory</DialogTitle>
        </DialogHeader>
        <motion.div 
          className="grid gap-4 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }
          }}
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={newMemory.date ? format(newMemory.date, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={newMemory.description}
              onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journalEntry" className="text-right">
              Journal Entry
            </Label>
            <Textarea
              id="journalEntry"
              value={newMemory.journalEntry}
              onChange={(e) => setNewMemory(prev => ({ ...prev, journalEntry: e.target.value }))}
              className="col-span-3"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="intensity" className="text-right">
              Intensity
            </Label>
            <Input
              id="intensity"
              type="number"
              min="1"
              max="4"
              value={newMemory.intensity}
              onChange={(e) => setNewMemory(prev => ({ ...prev, intensity: parseInt(e.target.value) as 1 | 2 | 3 | 4 }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="photo" className="text-right mt-2">
              Photo
            </Label>
            <div className="col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo')?.click()}
                >
                  Choose File
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {newMemory.photo ? 'Photo selected' : 'No file chosen'}
                </span>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {newMemory.photo && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border dark:border-gray-800"
                >
                  <img 
                    src={newMemory.photo} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm"
                    onClick={() => setNewMemory(prev => ({ ...prev, photo: undefined }))}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={handleAdd}>Add Memory</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 