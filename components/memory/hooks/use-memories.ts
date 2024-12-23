import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Memory } from '../types'

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch memories
  useEffect(() => {
    fetchMemories()
  }, [])

  useEffect(() => {
    async function testConnection() {
      console.log('Testing Supabase connection...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
        
        console.log('Supabase test response:', { data, error })
      } catch (err) {
        console.error('Supabase connection error:', err)
      }
    }

    testConnection()
  }, [])

  async function fetchMemories() {
    try {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      setMemories(data.map(memory => normalizeMemory(memory)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memories')
    } finally {
      setIsLoading(false)
    }
  }

  function normalizeMemory(data: any): Memory {
    console.log('Raw data from Supabase:', data)
    
    let photoUrl: string | undefined = undefined
    if (data.photo_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(data.photo_url)
      
      photoUrl = publicUrl
      console.log('Photo URL constructed:', photoUrl)
    }

    return {
      id: data.id,
      date: new Date(data.date),
      description: data.description,
      journalEntry: data.journal_entry,
      intensity: data.intensity as 1 | 2 | 3 | 4,
      photo: photoUrl,
      frameStyle: data.frame_style,
      photoEffect: data.photo_effect
    }
  }

  // Add these helper functions for image optimization
  async function optimizeImage(file: string, maxWidth = 1200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        // Use WebP with 0.8 quality
        resolve(canvas.toDataURL('image/webp', 0.8))
      }
      img.onerror = reject
      img.src = file
    })
  }

  // Update the addMemory function
  async function addMemory(newMemory: Omit<Memory, "id">) {
    try {
      let photoUrl = null
      if (newMemory.photo) {
        console.log('Uploading photo...')
        const optimizedPhoto = await optimizeImage(newMemory.photo)
        
        const fileName = `${Date.now()}.webp`
        const filePath = `photos/${fileName}`
        console.log('Uploading to:', filePath)
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('memory-photos')
          .upload(filePath, base64ToBlob(optimizedPhoto), {
            contentType: 'image/webp',
            upsert: true
          })
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('memory-photos')
          .getPublicUrl(filePath)

        photoUrl = filePath
        console.log('Photo URL set to:', publicUrl)
      }

      // Create memory record
      const { data, error } = await supabase
        .from('memories')
        .insert([{
          date: newMemory.date.toISOString(),
          description: newMemory.description,
          journal_entry: newMemory.journalEntry,
          intensity: newMemory.intensity,
          photo_url: photoUrl,
          frame_style: newMemory.frameStyle,
          photo_effect: newMemory.photoEffect
        }])
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Created memory:', data)
      const createdMemory = normalizeMemory(data)
      setMemories(prev => [...prev, createdMemory])
      return createdMemory
    } catch (err) {
      console.error('Add memory error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create memory')
      throw err
    }
  }

  // Update the editMemory function
  async function editMemory(editedMemory: Memory) {
    try {
      let photoUrl = editedMemory.photo
      if (photoUrl && photoUrl.startsWith('data:')) {
        const optimizedPhoto = await optimizeImage(photoUrl)
        const fileName = `${Date.now()}.webp`
        const { error: uploadError, data } = await supabase.storage
          .from('memory-photos')
          .upload(`photos/${fileName}`, base64ToBlob(optimizedPhoto))
        
        if (uploadError) throw uploadError
        photoUrl = `photos/${fileName}`
      }

      const { data, error } = await supabase
        .from('memories')
        .update({
          date: editedMemory.date.toISOString(),
          description: editedMemory.description,
          journal_entry: editedMemory.journalEntry,
          intensity: editedMemory.intensity,
          photo_url: photoUrl,
          frame_style: editedMemory.frameStyle,
          photo_effect: editedMemory.photoEffect
        })
        .eq('id', editedMemory.id)
        .select()
        .single()

      if (error) throw error

      const updatedMemory = normalizeMemory(data)
      setMemories(prev => prev.map(memory => 
        memory.id === editedMemory.id ? updatedMemory : memory
      ))
      return updatedMemory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update memory')
      throw err
    }
  }

  async function deleteMemory(id: string) {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMemories(prev => prev.filter(memory => memory.id !== id))
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

// Helper function to convert base64 to blob
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