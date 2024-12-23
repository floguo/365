import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

export type PhotoFrameStyle = 'polaroid' | 'vintage' | 'modern' | 'classic'
export type PhotoEffect = 'snow' | 'christmas' | 'sparkles' | 'none'

interface PhotoFrameProps {
  src?: string
  alt?: string
  caption?: string
  style?: PhotoFrameStyle
  effect?: PhotoEffect
  className?: string
}

const frameStyles = {
  polaroid: "bg-white p-2 shadow-lg rotate-[-1deg]",
  vintage: "bg-[#f4e4bc] p-3 shadow-md rotate-[1deg] border-2 border-[#d4b682]",
  modern: "bg-gray-100 p-1 shadow-xl rounded-sm",
  classic: "bg-white p-3 shadow-md border-8 border-white"
} as const

function ChristmasLights() {
  return (
    <>
      <div className="absolute -top-2 left-0 right-0 h-[2px] bg-gray-400/20" />
      
      <div className="absolute -top-3 left-0 right-0 flex justify-around">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="relative"
          >
            <motion.div
              className="w-3 h-3 rounded-full relative"
              style={{
                backgroundColor: [
                  '#ff4444', // red
                  '#44ff44', // green
                  '#4444ff', // blue
                  '#ffff44', // yellow
                  '#ff44ff'  // purple
                ][i % 5],
                boxShadow: `0 0 10px ${[
                  '#ff000088',
                  '#00ff0088',
                  '#0000ff88',
                  '#ffff0088',
                  '#ff00ff88'
                ][i % 5]}`
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-gray-400/20" />
          </motion.div>
        ))}
      </div>
    </>
  )
}

function Snow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.3,
          }}
          animate={{
            y: [-10, 200],
            x: [-10, 10],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

function Sparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

export function PhotoFrame({ 
  src, 
  alt, 
  caption, 
  style = 'polaroid', 
  effect = 'none',
  className 
}: PhotoFrameProps) {
  return (
    <motion.div
      className={cn(
        "inline-block transition-transform relative",
        frameStyles[style],
        className
      )}
      whileHover={{ scale: 1.02, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="relative">
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto object-cover aspect-square"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
            No photo
          </div>
        )}
        {effect === 'snow' && <Snow />}
        {effect === 'christmas' && <ChristmasLights />}
        {effect === 'sparkles' && <Sparkles />}
      </div>
      {caption && (
        <div className="mt-2 text-center font-handwriting text-sm text-gray-600">
          {caption}
        </div>
      )}
    </motion.div>
  )
} 