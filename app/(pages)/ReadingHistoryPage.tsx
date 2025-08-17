import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { dbGetReadingHistory } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const ReadingHistory = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(
    () => {
      let isCancelled = false
      const init = async () => {
        if (isInitialized.current) { return }
        isInitialized.current = true
        const m = await dbGetReadingHistory(db, 0, AppConstants.PAGE_LIMIT)
        if (isCancelled) { return }
        setManhwas(m)
        hasResults.current = m.length > 0
      }

      init()
      return () => { isCancelled = true }
    },
    [db]
  )
  
  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    setLoading(true)
      page.current += 1    
      const m = await dbGetReadingHistory(
        db, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      setManhwas(prev => [...prev, ...m])
      hasResults.current = m.length > 0
    setLoading(false)
  }


  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History'>
        <ReturnButton/>
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        hasResults={hasResults.current}
        showManhwaStatus={false}
        loading={loading}
        showChaptersPreview={false}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

export default ReadingHistory
