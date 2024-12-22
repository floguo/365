import { NextResponse } from 'next/server'

export type Memory = {
  id: string
  date: string
  description: string
  journalEntry?: string
  intensity: 1 | 2 | 3 | 4
  photo?: string
}

let memories: Memory[] = [
  { id: '1', date: '2024-11-05', description: "Bonfire night celebration", journalEntry: "The sky was lit up with amazing fireworks. The warmth of the bonfire made the chilly night feel cozy.", intensity: 3 },
  { id: '2', date: '2024-12-25', description: "Christmas morning", journalEntry: "Waking up to the excitement of presents under the tree. The smell of cinnamon and pine filled the air.", intensity: 4 },
  { id: '3', date: '2024-12-31', description: "New Year's Eve party", journalEntry: "Counting down to midnight with friends, the anticipation building as we watched the ball drop on TV.", intensity: 4 },
  { id: '4', date: '2025-01-01', description: "New Year's Day brunch", journalEntry: "Starting the year off right with a delicious spread of food and great company.", intensity: 3 },
  { id: '5', date: '2025-02-14', description: "Valentine's Day dinner", journalEntry: "A romantic candlelit dinner at our favorite restaurant. The food was exquisite, and the company even better.", intensity: 3 },
]

export async function GET() {
  try {
    return NextResponse.json(memories)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newMemory: Memory = await request.json()
    newMemory.id = Date.now().toString()
    memories.push(newMemory)
    return NextResponse.json(newMemory, { status: 201 })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const updatedMemory: Memory = await request.json()
    const index = memories.findIndex(m => m.id === updatedMemory.id)
    if (index !== -1) {
      memories[index] = updatedMemory
      return NextResponse.json(updatedMemory)
    }
    return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const initialLength = memories.length
    memories = memories.filter(m => m.id !== id)
    if (memories.length === initialLength) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

