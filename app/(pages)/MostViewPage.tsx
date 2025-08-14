import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 32


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
          const m: Manhwa[] = await dbReadManhwasOrderedByViews(db, 0, PAGE_LIMIT)
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
      const m: Manhwa[] = await dbReadManhwasOrderedByViews(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Views' titleColor={Colors.yellow} >
        <ReturnButton color={Colors.yellow} />
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}/>
    </SafeAreaView>
  )
  
}

export default MostView
