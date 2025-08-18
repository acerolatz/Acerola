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
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)

  const fetchingOnEndReached = useRef(false)
  const isInitialized = useRef(false)
  const hasResults = useRef(true)
  const page = useRef(0)

  useEffect(
    () => {
      const init = async () => {
        setLoading(true)
          const m = await dbGetReadingHistory(db, 0, AppConstants.PAGE_LIMIT)        
          setManhwas(m)
        setLoading(false)
        hasResults.current = m.length >= AppConstants.PAGE_LIMIT
        isInitialized.current = true
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
    setLoading(true)
      page.current += 1    
      const m = await dbGetReadingHistory(
        db, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
    hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    fetchingOnEndReached.current = true
  }


  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History'>
        <ReturnButton/>
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        hasResults={hasResults.current}
        showManhwaStatus={false}
        showChaptersPreview={false}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

export default ReadingHistory
