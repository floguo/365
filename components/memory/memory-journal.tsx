import { MemoryGrid } from './memory-grid'
import { MemoryCard } from './memory-card'
import { AddMemoryDialog } from './add-memory-dialog'
import type { Memory } from './types'

export default function MemoryJournal() {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Calculate grid data
  const { grid, monthLabels, graphWidth } = useMemoryGrid()

  return (
    <motion.div layout="size" className="relative p-4 rounded-lg border bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-2 h-10">
        <h2>{memories.length} memories together</h2>
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
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 