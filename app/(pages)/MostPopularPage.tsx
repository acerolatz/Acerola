import ReturnButton from '@/app/components/buttons/ReturnButton'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import React, { useEffect, useRef, useState } from 'react'
import ManhwaGrid from '@/app/components/grid/ManhwaGrid'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/app/components/TopBar'
import { Manhwa } from '@/helpers/types'
import { AppConstants } from '@/constants/AppConstants'



const MostPopularPage = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  
  const manhwasRef = useRef<Manhwa[]>([])
  const fetching = useRef(false)
  const isMounted = useRef(false)
  const hasResults = useRef(true)
  const page = useRef(0)

  useEffect(
    () => {
      isMounted.current = true
      async function init() {
        const m: Manhwa[] = await dbReadManhwasOrderedByViews(db, 0, AppConstants.VALIDATION.PAGE_LIMIT)
        if (!isMounted.current) { return }
        setManhwas(m)
        manhwasRef.current = m
        hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
      }
      init()      
      return () => { isMounted.current = false }
    },
    [db]
  )
  
  const onEndReached = async () => {
    if (fetching.current || !hasResults.current) { return }
    fetching.current = true
    page.current += 1
    const m: Manhwa[] = await dbReadManhwasOrderedByViews(
      db, 
      page.current * AppConstants.VALIDATION.PAGE_LIMIT, 
      AppConstants.VALIDATION.PAGE_LIMIT
    )
    if (isMounted.current && m.length) {
      manhwasRef.current.push(...m)
      setManhwas([...manhwasRef.current])
      hasResults.current = m.length >= AppConstants.VALIDATION.PAGE_LIMIT
    }
    fetching.current = false
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Popular'>
        <ReturnButton/>
      </TopBar>
      <ManhwaGrid manhwas={manhwas} onEndReached={onEndReached}/>
    </SafeAreaView>
  )
  
}

export default MostPopularPage