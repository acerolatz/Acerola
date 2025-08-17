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



const MostView = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  useEffect(
    () => {
      let isCancelled = false
      async function init() {
        setLoading(true)
          const m: Manhwa[] = await dbReadManhwasOrderedByViews(db, 0, AppConstants.PAGE_LIMIT)
          if (isCancelled) { return }
          setManhwas(m)
          isInitialized.current = true
        setLoading(false)
      }

      init()
      return () => { isCancelled = true }
    },
    [db]
  )
  
  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) {
      return
    }
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await dbReadManhwasOrderedByViews(
        db, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
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
        showChaptersPreview={false}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}/>
    </SafeAreaView>
  )
  
}

export default MostView