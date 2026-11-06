import { useCallback, useEffect, useState } from 'react'
import { fetchRanking } from '../services/rankingService'

// Compara dois placares para não re-renderizar (nem reiniciar animações) quando nada mudou.
function sameRows(a, b) {
  if (a.length !== b.length) return false
  return a.every(
    (row, i) =>
      row.id === b[i].id &&
      row.position === b[i].position &&
      row.score === b[i].score &&
      row.total_time_ms === b[i].total_time_ms &&
      row.name === b[i].name,
  )
}

// Carrega o ranking e atualiza sozinho a cada intervalMs (e ao voltar para a aba).
export function useRanking(intervalMs) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await fetchRanking()
      setRows((prev) => (sameRows(prev, data) ? prev : data))
      setError(null)
      setUpdatedAt(new Date())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    const onVisible = () => {
      if (!document.hidden) load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load, intervalMs])

  return { rows, loading, refreshing, error, updatedAt, refresh: load }
}