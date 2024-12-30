import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(memories)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching memories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.create({
      data: {
        date: new Date(body.date),
        description: body.description,
        journalEntry: body.journalEntry,
        intensity: body.intensity,
      }
    })
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating memory' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.update({
      where: { id: body.id },
      data: {
        date: new Date(body.date),
        description: body.description,
        journalEntry: body.journalEntry,
        intensity: body.intensity,
      }
    })
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating memory' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    await prisma.memory.delete({
      where: { id: body.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting memory' }, { status: 500 })
  }
}

