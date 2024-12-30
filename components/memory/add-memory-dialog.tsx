import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { AddMemoryDialogProps, Memory } from './types'
import DatePicker from "@/components/ui/date-picker"

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
            <div className="col-span-3">
              <DatePicker
                date={newMemory.date || new Date()}
                onSelect={(date) => date && setNewMemory(prev => ({ ...prev, date }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Memory Title
            </Label>
            <Input
              id="description"
              placeholder="What's this memory about?"
              value={newMemory.description}
              onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journalEntry" className="text-right">
              Reflection
            </Label>
            <Textarea
              id="journalEntry"
              placeholder="Jot down what happened & how you felt"
              value={newMemory.journalEntry}
              onChange={(e) => setNewMemory(prev => ({ ...prev, journalEntry: e.target.value }))}
              className="col-span-3"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="intensity" className="text-right">
              Significance
            </Label>
            <div className="col-span-3">
              <Input
                id="intensity"
                type="number"
                min="1"
                max="4"
                placeholder="How significant was this memory? (1-4)"
                value={newMemory.intensity}
                onChange={(e) => setNewMemory(prev => ({ ...prev, intensity: parseInt(e.target.value) as 1 | 2 | 3 | 4 }))}
                className="col-span-3"
              />

            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <Button onClick={handleAdd}>Add Memory</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 