import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import KanbanBoard from './components/KanbanBoard'
import NewDealModal from './components/NewDealModal'
import type { Deal, Stage } from './types/deal'
import type { User } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<Deal[]>([])
  const [showNewDeal, setShowNewDeal] = useState(false)

  const loadDeals = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDeals(data as Deal[])
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session?.user ?? null
      setUser(current)
      if (current) {
        loadDeals(current.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = session?.user ?? null
      setUser(current)
      if (current) {
        loadDeals(current.id)
      } else {
        setDeals([])
      }
    })

    return () => subscription.unsubscribe()
  }, [loadDeals])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleMoveDeal(dealId: string, newStage: Stage) {
    const previous = deals
    setDeals((current) =>
      current.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)),
    )

    const { error } = await supabase
      .from('deals')
      .update({ stage: newStage })
      .eq('id', dealId)

    if (error) {
      setDeals(previous)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка…
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Моя CRM</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewDeal(true)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Новая сделка
          </button>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <KanbanBoard deals={deals} onMove={handleMoveDeal} />
      </main>

      {showNewDeal && user && (
        <NewDealModal
          userId={user.id}
          onClose={() => setShowNewDeal(false)}
          onCreated={() => loadDeals(user.id)}
        />
      )}
    </div>
  )
}

export default App
