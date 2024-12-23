import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(memories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const memory = await prisma.memory.create({
      data: {
        date: new Date(data.date),
        description: data.description,
        journalEntry: data.journalEntry,
        intensity: data.intensity,
        photo: data.photo
      }
    })
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
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

