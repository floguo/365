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
    <div className="absolute -top-3 left-0 right-0 flex justify-around">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4]
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
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
            className="w-full h-auto max-w-[300px] object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
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