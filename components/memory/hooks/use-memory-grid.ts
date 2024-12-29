import { eachDayOfInterval, getDay, addDays, subDays } from 'date-fns'

export function useMemoryGrid() {
  const startDate = subDays(new Date(2023, 12, 1), getDay(new Date(2023, 12, 1))) // Sunday before start date
  const endDate = subDays(addDays(new Date(2024, 12, 1), 7), getDay(addDays(new Date(2024, 12, 1), 7)) + 1) // last Saturday after end date
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Calculate the number of weeks
  const numberOfWeeks = Math.ceil(days.length / 7)

  // Calculate the width of the graph
  const graphWidth = numberOfWeeks * 12 + 44 // 12px per week + 44px for weekday labels
  const componentWidth = graphWidth + 32 // Add 16px padding on each side

  // Create 7xN grid of dates (N weeks to cover the full year)
  const grid = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: numberOfWeeks }, (_, col) => {
      const dayIndex = col * 7 + row
      return dayIndex < days.length ? days[dayIndex] : null
    })
  )

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const getMonthLabels = () => {
    const labels: (string | null)[] = Array(numberOfWeeks).fill(null)
    grid[0].forEach((date, index) => {
      if (date && date.getDate() <= 7) {
        labels[index] = months[date.getMonth()]
      }
    })
    return labels
  }

  return {
    grid,
    monthLabels: getMonthLabels(),
    graphWidth,
    componentWidth,
  }
} 