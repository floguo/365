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
  const getMemoryForDate = (date: Date | null) => {
    if (!date) return null
    return memories.find(memory => isSameDay(memory.date, date))
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
                const memory = getMemoryForDate(date)
                return (
                  <TooltipProvider key={colIndex}>
                    <Tooltip delayDuration={50}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`w-[10px] h-[10px] rounded-sm ${date ? intensityColors[memory?.intensity || 0] : 'bg-transparent'}
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
                          onClick={() => date && onSelectMemory(memory || null)}
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
    </div>
  )
} 