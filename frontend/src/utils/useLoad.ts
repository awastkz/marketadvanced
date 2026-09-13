import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { errorMessage } from './format'

interface LoadState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
  setData: (updater: T | ((prev: T | null) => T | null)) => void
}

/** Загрузка данных с состоянием loading/error и ручным reload. */
export function useLoad<T>(fn: () => Promise<T>, deps: DependencyList): LoadState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [load, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { data, loading, error, reload, setData }
}
