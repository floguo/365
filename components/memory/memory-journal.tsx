"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MemoryGrid } from './memory-grid'
import { MemoryCard } from './memory-card'
import { AddMemoryDialog } from './add-memory-dialog'
import { useMemoryGrid } from './hooks/use-memory-grid'
import type { Memory } from './types'

const initialMemories: Memory[] = [
  { id: '1', date: new Date(2024, 10, 5), description: "Bonfire night celebration", journalEntry: "The sky was lit up with amazing fireworks. The warmth of the bonfire made the chilly night feel cozy.", intensity: 3 },
  { id: '2', date: new Date(2024, 11, 25), description: "Christmas morning", journalEntry: "Waking up to the excitement of presents under the tree. The smell of cinnamon and pine filled the air.", intensity: 4 },
  { id: '3', date: new Date(2024, 11, 31), description: "New Year's Eve party", journalEntry: "Counting down to midnight with friends, the anticipation building as we watched the ball drop on TV.", intensity: 4 },
]

const weekdays = ['Mon', 'Wed', 'Fri']

export default function MemoryJournal() {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { grid, monthLabels, graphWidth, componentWidth } = useMemoryGrid()

  // Sort memories by date (newest first) and then by creation time
  const sortedMemories = [...memories].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime()
    if (dateCompare === 0) {
      // If same date, sort by ID (assuming ID is timestamp-based)
      return a.id.localeCompare(b.id)
    }
    return dateCompare
  })

  const selectedMemoryIndex = selectedMemory 
    ? sortedMemories.findIndex(m => m.id === selectedMemory.id)
    : -1

  const handleAddMemory = (newMemory: Omit<Memory, "id">) => {
    const memoryToAdd: Memory = {
      ...newMemory,
      id: Date.now().toString(),
    }
    setMemories(prev => [...prev, memoryToAdd])
    setIsDialogOpen(false)
  }

  const handleEditMemory = (editedMemory: Memory) => {
    setMemories(prev => prev.map(memory => 
      memory.id === editedMemory.id ? editedMemory : memory
    ))
    setIsEditing(false)
  }

  const handleDeleteMemory = () => {
    if (selectedMemory) {
      setMemories(prev => prev.filter(memory => memory.id !== selectedMemory.id))
      setSelectedMemory(null)
    }
  }

  const handlePrevMemory = () => {
    setSelectedMemory(
      selectedMemoryIndex > 0 
        ? sortedMemories[selectedMemoryIndex - 1]
        : sortedMemories[sortedMemories.length - 1]
    )
  }

  const handleNextMemory = () => {
    setSelectedMemory(
      selectedMemoryIndex < sortedMemories.length - 1
        ? sortedMemories[selectedMemoryIndex + 1]
        : sortedMemories[0]
    )
  }

  return (
    <motion.div 
      layout="size"
      className="relative p-4 rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden"
      style={{
        width: `${componentWidth}px`,
        minWidth: `${componentWidth}px`,
        maxWidth: '100%',
        height: '100%',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        layout: { duration: 0.6, type: "spring", bounce: 0.35 },
        scale: { duration: 0.4, type: "spring", bounce: 0.3 }
      }}
    >
      <div className="flex justify-between items-center mb-2 h-10">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {memories.length} memories this year
        </h2>
        <AddMemoryDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAdd={handleAddMemory}
        />
      </div>

      <MemoryGrid
        memories={memories}
        grid={grid}
        monthLabels={monthLabels}
        weekdays={weekdays}
        graphWidth={graphWidth}
        onSelectMemory={setSelectedMemory}
      />

      <AnimatePresence mode="sync">
        {selectedMemory && (
          <MemoryCard
            memory={selectedMemory}
            isEditing={isEditing}
            onEdit={handleEditMemory}
            onDelete={handleDeleteMemory}
            onClose={() => setSelectedMemory(null)}
            onEditStart={() => setIsEditing(true)}
            onEditCancel={() => setIsEditing(false)}
            onPrev={handlePrevMemory}
            onNext={handleNextMemory}
            currentIndex={selectedMemoryIndex}
            totalCount={sortedMemories.length}
            memories={sortedMemories}
            onSelectMemory={setSelectedMemory}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 