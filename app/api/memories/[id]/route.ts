import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const memory = await prisma.memory.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.memory.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
} 