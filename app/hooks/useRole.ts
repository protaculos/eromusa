'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setRole(null)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setRole(profile?.role || 'client')
      } catch (error) {
        console.error('Error fetching role:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, loading }
}
