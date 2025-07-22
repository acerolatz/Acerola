import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbReadManhwasOrderedByUpdateAt } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 30


const LatestUpdatesPage = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(
    () => {
      async function init() {
          setLoading(true)
            await dbReadManhwasOrderedByUpdateAt(db, 0, PAGE_LIMIT)
              .then(values => {
                hasResults.current =  values.length > 0
                setManhwas(values)
              })
            isInitialized.current = true
          setLoading(false)
      }
      init()
    },
    [db]
  )

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      await dbReadManhwasOrderedByUpdateAt(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas(prev => [...prev, ...values])
        })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Latest Updates' titleColor={Colors.yellow} >
        <ReturnButton color={Colors.yellow} />
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        numColumns={2}
        hasResults={true}
        showChaptersPreview={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlashList'
      />
    </SafeAreaView>
  )
}

export default LatestUpdatesPage
