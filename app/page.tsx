import { TestSupabase } from '@/components/test-supabase'
import MemoryJournal from '../components/memory/memory-journal'

export default function Home() {
  return (
    <>
      <TestSupabase />
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <MemoryJournal />
      </main>
    </>
  )
}

