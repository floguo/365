"use client"

import React, { useState } from 'react'
import { format, eachDayOfInterval, isSameDay, getMonth, getDay, addDays, subDays } from 'date-fns'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Memory = {
  id: string
  date: Date
  description: string
  journalEntry?: string
  intensity: 1 | 2 | 3 | 4
  photo?: string
}

const intensityColors = {
  0: 'bg-[#ebedf0] dark:bg-gray-800',
  1: 'bg-[#9be9a8] dark:bg-emerald-900',
  2: 'bg-[#40c463] dark:bg-emerald-700',
  3: 'bg-[#30a14e] dark:bg-emerald-600',
  4: 'bg-[#216e39] dark:bg-emerald-500'
}

const weekdays = ['Mon', 'Wed', 'Fri']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Sample initial memories
const initialMemories: Memory[] = [
  { id: '1', date: new Date(2024, 10, 5), description: "Bonfire night celebration", journalEntry: "The sky was lit up with amazing fireworks. The warmth of the bonfire made the chilly night feel cozy.", intensity: 3 },
  { id: '2', date: new Date(2024, 11, 25), description: "Christmas morning", journalEntry: "Waking up to the excitement of presents under the tree. The smell of cinnamon and pine filled the air.", intensity: 4 },
  { id: '3', date: new Date(2024, 11, 31), description: "New Year's Eve party", journalEntry: "Counting down to midnight with friends, the anticipation building as we watched the ball drop on TV.", intensity: 4 },
  { id: '4', date: new Date(2025, 0, 1), description: "New Year's Day brunch", journalEntry: "Starting the year off right with a delicious spread of food and great company.", intensity: 3 },
  { id: '5', date: new Date(2025, 1, 14), description: "Valentine's Day dinner", journalEntry: "A romantic candlelit dinner at our favorite restaurant. The food was exquisite, and the company even better.", intensity: 3 },
]

export default function MemoryJournal() {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newMemory, setNewMemory] = useState<Partial<Memory>>({
    date: new Date(),
    description: '',
    journalEntry: '',
    intensity: 1,
  })

  // Generate dates from the Sunday before November 1, 2024 to the last Saturday of October 2025
  const startDate = subDays(new Date(2024, 10, 1), getDay(new Date(2024, 10, 1))) // Sunday before November 1, 2024
  const endDate = subDays(addDays(new Date(2025, 10, 1), 7), getDay(addDays(new Date(2025, 10, 1), 7)) + 1) // Last Saturday of October 2025
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Calculate the number of weeks
  const numberOfWeeks = Math.ceil(days.length / 7)

  // Calculate the width of the graph
  const graphWidth = numberOfWeeks * 12 + 44; // 12px per week + 44px for weekday labels
  const componentWidth = graphWidth + 32; // Add 16px padding on each side

  // Create 7xN grid of dates (N weeks to cover the full year)
  const grid = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: numberOfWeeks }, (_, col) => {
      const dayIndex = col * 7 + row
      return dayIndex < days.length ? days[dayIndex] : null
    })
  )

  const getMemoryForDate = (date: Date | null) => {
    if (!date) return null
    return memories.find(memory => isSameDay(memory.date, date))
  }

  const getMonthLabels = () => {
    const labels: (string | null)[] = Array(numberOfWeeks).fill(null)
    grid[0].forEach((date, index) => {
      if (date && date.getDate() <= 7) {
        const weekStart = grid[0][index]
        const weekEnd = grid[6][index]
        if (weekStart && weekEnd && getMonth(weekStart) === getMonth(weekEnd)) {
          labels[index] = months[getMonth(date)]
        }
      }
    })
    return labels
  }

  const monthLabels = getMonthLabels()

  const handleAddMemory = () => {
    if (newMemory.date && newMemory.description && newMemory.intensity) {
      const memoryToAdd: Memory = {
        id: Date.now().toString(),
        date: newMemory.date,
        description: newMemory.description,
        journalEntry: newMemory.journalEntry,
        intensity: newMemory.intensity as 1 | 2 | 3 | 4,
        photo: newMemory.photo,
      }
      setMemories(prev => [...prev, memoryToAdd])
      setIsDialogOpen(false)
      setNewMemory({ date: new Date(), description: '', journalEntry: '', intensity: 1 })
    }
  }

  const handleEditMemory = () => {
    if (selectedMemory) {
      setMemories(prev => prev.map(memory => 
        memory.id === selectedMemory.id ? selectedMemory : memory
      ))
      setIsEditing(false)
    }
  }

  const handleDeleteMemory = () => {
    if (selectedMemory) {
      setMemories(prev => prev.filter(memory => memory.id !== selectedMemory.id))
      setSelectedMemory(null)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEditing && selectedMemory) {
          setSelectedMemory(prev => prev ? { ...prev, photo: reader.result as string } : null)
        } else {
          setNewMemory(prev => ({ ...prev, photo: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <LayoutGroup>
      <motion.div 
        layout
        className="relative p-4 rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden"
        style={{
          width: `${componentWidth}px`,
          minWidth: `${componentWidth}px`,
          maxWidth: '100%',
        }}
        transition={{
          layout: { duration: 0.2, ease: "easeInOut" }
        }}
      >
        <motion.div layout="position">
          <motion.div layout="position" className="flex justify-between items-center mb-2 h-10">
            <motion.h2 
              layout="position"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {memories.length} memories together
            </motion.h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Memory</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add a New Memory</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMemory.date ? format(newMemory.date, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, date: new Date(e.target.value) }))}
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="photo" className="text-right">
                      Photo
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="col-span-3"
                    />
                  </div>
                  {newMemory.photo && (
                    <div className="col-span-4 flex justify-center">
                      <div className="polaroid">
                        <img src={newMemory.photo} alt="Memory preview" className="w-full h-auto" />
                        <div className="caption text-sm">{newMemory.description || 'New memory'}</div>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleAddMemory}>Add Memory</Button>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div layout="position" className="flex flex-col mt-8">
            {/* Month labels */}
            <div className="flex ml-[44px] mb-1 text-xs text-gray-400" style={{ width: `${graphWidth - 44}px` }}>
              {monthLabels.map((month, index) => (
                <div key={`month-${index}`} className="w-[10px] mr-[2px]">
                  {month && <span className="inline-block w-8 -ml-3">{month}</span>}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Weekday labels */}
              <div className="relative text-xs text-gray-400 w-[30px] mr-1" style={{ height: '82px' }}>
                {weekdays.map((day, index) => (
                  <div 
                    key={`weekday-${index}`} 
                    className="absolute flex items-center"
                    style={{
                      top: `${(index * 2 + 1) * 12 - 2}px`
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Main grid */}
              <div className="relative" style={{ height: '82px', width: `${graphWidth - 44}px` }}>
                {grid.map((row, rowIndex) => (
                  <div 
                    key={rowIndex} 
                    className="absolute flex gap-[2px]"
                    style={{
                      top: `${rowIndex * 12}px`
                    }}
                  >
                    {row.map((date, colIndex) => {
                      const memory = getMemoryForDate(date)
                      return (
                        <TooltipProvider key={colIndex}>
                          <Tooltip delayDuration={50}>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={`w-[10px] h-[10px] rounded-sm ${date ? intensityColors[memory?.intensity || 0] : 'bg-transparent'}
                                  ${date ? 'cursor-pointer' : ''}`}
                                whileHover={date ? { scale: 1.2 } : {}}
                                whileTap={date ? { scale: 0.9 } : {}}
                                onClick={() => date && setSelectedMemory(prev => prev?.id === memory?.id ? null : (memory || null))}
                                tabIndex={date ? 0 : -1}
                                role={date ? "button" : "presentation"}
                                aria-label={date ?
                                  (memory ?
                                    `Memory on ${format(date, 'MMM d, yyyy')}` :
                                    `No memory on ${format(date, 'MMM d, yyyy')}`) :
                                  undefined}
                              />
                            </TooltipTrigger>
                            {date && (
                              <TooltipContent>
                                {memory ? (
                                  <p>{format(date, 'MMM d, yyyy')}: {memory.description}</p>
                                ) : (
                                  <p>{format(date, 'MMM d, yyyy')}: No memory</p>
                                )}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div layout="position" className="mt-4 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div 
                key={intensity} 
                className={`w-[10px] h-[10px] ${intensityColors[intensity as keyof typeof intensityColors]} rounded-sm`} 
              />
            ))}
            <span>More</span>
          </motion.div>
        </motion.div>

        <AnimatePresence presenceAffectsLayout>
          {selectedMemory && (
            <motion.div
              layout
              key="selected-memory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                layout: { duration: 0.3, ease: "easeInOut" }
              }}
              className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <motion.div layout className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 flex flex-col">
                    <div className="polaroid mb-6">
                      {selectedMemory.photo ? (
                        <img src={selectedMemory.photo} alt="Memory" className="w-full h-auto rounded-sm" />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-sm">No photo</div>
                      )}
                      <div className="caption mt-2">
                        <span className="text-sm">{selectedMemory.description}</span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center">
                        {!isEditing && (
                          <>
                            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
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
                                  <AlertDialogAction onClick={handleDeleteMemory}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    {isEditing ? (
                      <div className="grid gap-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-date" className="text-right">
                            Date
                          </Label>
                          <Input
                            id="edit-date"
                            type="date"
                            value={format(selectedMemory.date, 'yyyy-MM-dd')}
                            onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, date: new Date(e.target.value) } : null)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-description" className="text-right">
                            Description
                          </Label>
                          <Input
                            id="edit-description"
                            value={selectedMemory.description}
                            onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, description: e.target.value } : null)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="edit-journalEntry" className="text-right mt-2">
                            Journal Entry
                          </Label>
                          <Textarea
                            id="edit-journalEntry"
                            value={selectedMemory.journalEntry}
                            onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, journalEntry: e.target.value } : null)}
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
                            value={selectedMemory.intensity}
                            onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, intensity: parseInt(e.target.value) as 1 | 2 | 3 | 4 } : null)}
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
                            onChange={handlePhotoUpload}
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                          <Button onClick={handleEditMemory}>Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold mb-4">{format(selectedMemory.date, 'MMMM d, yyyy')}</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {selectedMemory.journalEntry || 'No journal entry for this memory.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  )
}

