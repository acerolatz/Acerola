import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import { dbGetManhwaReadingHistory } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const ReadingHistory = () => {

  const db = useSQLiteContext()
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  
  const manhwasRef = useRef<Manhwa[]>([])
  const fetching = useRef(false)
  const hasResults = useRef(true)
  const isMounted = useRef(true)
  const page = useRef(0)

  useEffect(() => {
    isMounted.current = true
    const init = async () => {
      const m = await dbGetManhwaReadingHistory(db, 0, AppConstants.VALIDATION.PAGE_LIMIT)        
      if (!isMounted.current) { return }
      setManhwas(m)
      manhwasRef.current = m
      hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
    }
    init()
    return () => { isMounted.current = false }
  }, [db])
  
  const onEndReached = async () => {
    if (fetching.current || !hasResults.current) { return }
    fetching.current = true
    page.current += 1    
    const m = await dbGetManhwaReadingHistory(
      db, 
      page.current * AppConstants.VALIDATION.PAGE_LIMIT, 
      AppConstants.VALIDATION.PAGE_LIMIT
    )
    if (isMounted.current && m.length) {
      manhwasRef.current.push(...m)
      setManhwas([...manhwasRef.current])
      hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
    }
    fetching.current = true
  }


  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History'>
        <ReturnButton/>
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        showManhwaStatus={false}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

export default ReadingHistory
