import { motion } from 'framer-motion'
import { format, isSameDay } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Memory, type MemoryGridProps, intensityColors } from './types'

export function MemoryGrid({ 
  memories, 
  grid, 
  monthLabels, 
  weekdays, 
  graphWidth,
  onSelectMemory 
}: MemoryGridProps) {
  const getMemoriesForDate = (date: Date | null) => {
    if (!date) return []
    return memories
      .filter(memory => 
        memory.date.getFullYear() === date.getFullYear() &&
        memory.date.getMonth() === date.getMonth() &&
        memory.date.getDate() === date.getDate()
      )
      .sort((a, b) => {
        // Sort chronologically (earliest first)
        return a.id.localeCompare(b.id)
      })
  }

  const getIntensityForDate = (date: Date | null) => {
    if (!date) return 0
    const dateMemories = getMemoriesForDate(date)
    // Map number of memories to intensity levels (1-4)
    if (dateMemories.length === 0) return 0
    if (dateMemories.length === 1) return 1
    if (dateMemories.length === 2) return 2
    if (dateMemories.length === 3) return 3
    return 4  // 4 or more memories
  }

  return (
    <div className="flex flex-col mt-8">
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
                const memory = getMemoriesForDate(date)
                return (
                  <TooltipProvider key={colIndex}>
                    <Tooltip delayDuration={50}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`w-[10px] h-[10px] rounded-sm ${date ? intensityColors[getIntensityForDate(date) || 0] : 'bg-transparent'}
                            ${date ? 'cursor-pointer' : ''}`}
                          whileHover={date ? { 
                            scale: 1.45,
                            rotate: 3,
                            transition: { 
                              type: "spring",
                              stiffness: 400,
                              damping: 15
                            }
                          } : {}}
                          whileTap={date ? { 
                            scale: 0.9,
                            rotate: -3,
                            transition: { 
                              type: "spring",
                              stiffness: 400,
                              damping: 15
                            }
                          } : {}}
                          onClick={() => {
                            if (date) {
                              const dateMemories = getMemoriesForDate(date)
                              // Select the earliest memory for that day
                              const earliestMemory = dateMemories.length > 0 
                                ? dateMemories[0]  // Already sorted chronologically
                                : null
                              onSelectMemory(earliestMemory)
                            }
                          }}
                          tabIndex={date ? 0 : -1}
                          role={date ? "button" : "presentation"}
                          aria-label={date ?
                            (getMemoriesForDate(date).length > 0 ?
                              `${getMemoriesForDate(date).length} ${
                                getMemoriesForDate(date).length === 1 ? 'memory' : 'memories'
                              } on ${format(date, 'MMM d, yyyy')}` :
                              `No memories on ${format(date, 'MMM d, yyyy')}`) :
                            undefined}
                        />
                      </TooltipTrigger>
                      {date && (
                        <TooltipContent>
                          {date && (
                            <>
                              <p className="font-medium">{format(date, 'MMM d, yyyy')}</p>
                              {memories.length > 0 ? (
                                <ul className="mt-1 space-y-1">
                                  {getMemoriesForDate(date).map(memory => (
                                    <li key={memory.id} className="text-sm">
                                      {memory.description}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>No memories</p>
                              )}
                            </>
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
    </div>
  )
} 