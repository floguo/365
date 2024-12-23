import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Memory } from '../types'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMemories()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('memories')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'memories' 
        }, 
        (payload: RealtimePostgresChangesPayload<{
          [key: string]: any;
        }>) => {
          if (payload.eventType === 'INSERT') {
            setMemories(prev => [...prev, normalizeMemory(payload.new)])
          } else if (payload.eventType === 'DELETE') {
            setMemories(prev => prev.filter(m => m.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setMemories(prev => prev.map(m => 
              m.id === payload.new.id ? normalizeMemory(payload.new) : m
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchMemories() {
    try {
      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      setMemories(data.map(normalizeMemory))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memories')
    } finally {
      setIsLoading(false)
    }
  }

  async function addMemory(newMemory: Omit<Memory, "id">) {
    try {
      let photoUrl = null
      if (newMemory.photo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('memory-photos')
          .upload(`photos/${Date.now()}`, base64ToBlob(newMemory.photo))
        
        if (uploadError) throw uploadError
        photoUrl = uploadData.path
      }

      const { data, error } = await supabase
        .from('memories')
        .insert([{
          date: newMemory.date.toISOString(),
          description: newMemory.description,
          journal_entry: newMemory.journalEntry,
          intensity: newMemory.intensity,
          photo_url: photoUrl
        }])
        .select()
        .single()

      if (error) throw error
      return normalizeMemory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create memory')
      throw err
    }
  }

  async function editMemory(editedMemory: Memory) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .update({
          date: editedMemory.date.toISOString(),
          description: editedMemory.description,
          journal_entry: editedMemory.journalEntry,
          intensity: editedMemory.intensity,
          photo_url: editedMemory.photo
        })
        .eq('id', editedMemory.id)
        .select()
        .single()

      if (error) throw error
      return normalizeMemory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update memory')
      throw err
    }
  }

  async function deleteMemory(id: string) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return normalizeMemory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete memory')
      throw err
    }
  }

  return {
    memories,
    isLoading,
    error,
    addMemory,
    editMemory,
    deleteMemory
  }
}

// Helper to convert Supabase data to our Memory type
function normalizeMemory(data: any): Memory {
  return {
    id: data.id,
    date: new Date(data.date),
    description: data.description,
    journalEntry: data.journal_entry,
    intensity: data.intensity,
    photo: data.photo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/memory-photos/${data.photo_url}` : undefined
  }
}

// Helper to convert base64 to blob for upload
function base64ToBlob(base64: string) {
  const [meta, data] = base64.split(',')
  const contentType = meta.split(':')[1].split(';')[0]
  const byteCharacters = atob(data)
  const byteArrays = []

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i))
  }

  return new Blob([new Uint8Array(byteArrays)], { type: contentType })
} 