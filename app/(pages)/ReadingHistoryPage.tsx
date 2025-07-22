import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbGetReadingHistory } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 32


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
        const m = await dbGetReadingHistory(db, 0, PAGE_LIMIT)
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
      const m = await dbGetReadingHistory(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
      setManhwas(prev => [...prev, ...m])
      hasResults.current = m.length > 0
    setLoading(false)
  }


  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History' titleColor={Colors.readingHistoryColor} >
        <ReturnButton color={Colors.readingHistoryColor} />
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        onEndReached={onEndReached}
        numColumns={2}
        hasResults={hasResults.current}
        listMode='FlashList'
        showManhwaStatus={false}
        color={Colors.readingHistoryColor}
        showChaptersPreview={false}
        loading={loading}
      />
    </SafeAreaView>
  )
}

export default ReadingHistory
