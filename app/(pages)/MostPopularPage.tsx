import ReturnButton from '@/components/buttons/ReturnButton'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import React, { useEffect, useRef, useState } from 'react'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'
import { AppConstants } from '@/constants/AppConstants'



const MostPopularPage = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  
  const fetchingOnEndReached = useRef(false)
  const isInitialized = useRef(false)
  const hasResults = useRef(true)
  const page = useRef(0)

  useEffect(
    () => {
      async function init() {
        setLoading(true)
          const m: Manhwa[] = await dbReadManhwasOrderedByViews(db, 0, AppConstants.PAGE_LIMIT)
          setManhwas(m)
          hasResults.current = m.length >= AppConstants.PAGE_LIMIT
          isInitialized.current = true
        setLoading(false)
      }
      init()      
    },
    [db]
  )
  
  const onEndReached = async () => {
    if (
      fetchingOnEndReached.current ||
      !hasResults.current || 
      !isInitialized.current
    ) { return }
    fetchingOnEndReached.current = true
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await dbReadManhwasOrderedByViews(
        db, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      setManhwas(prev => [...prev, ...m])
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
      fetchingOnEndReached.current = false
    setLoading(false)
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Popular'>
        <ReturnButton/>
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        hasResults={hasResults.current}
        showChaptersPreview={false}
        onEndReached={onEndReached}/>
    </SafeAreaView>
  )
  
}

export default MostPopularPage