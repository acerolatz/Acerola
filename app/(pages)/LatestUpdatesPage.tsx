import { dbReadManhwasOrderedByUpdateAt } from '@/lib/database'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const LatestUpdatesPage = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)

  const fetchingOnEndReached = useRef(false)
  const isInitialized = useRef(false)
  const hasResults = useRef(true)

  useEffect(
    () => {      
      async function init() {
          setLoading(true)
            const m = await dbReadManhwasOrderedByUpdateAt(db, 0, AppConstants.PAGE_LIMIT)
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
      const m = await dbReadManhwasOrderedByUpdateAt(
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
      <TopBar title='Latest Updates' >
        <ReturnButton />
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        showChaptersPreview={false}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

export default LatestUpdatesPage
