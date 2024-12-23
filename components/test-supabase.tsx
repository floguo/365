'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function TestSupabase() {
  useEffect(() => {
    async function test() {
      console.log('ENV vars:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + '...'
      })

      try {
        const { data, error } = await supabase.from('memories').select('*')
        console.log('Supabase response:', { data, error })
      } catch (e) {
        console.error('Supabase error:', e)
      }
    }
    test()
  }, [])

  return null
} 