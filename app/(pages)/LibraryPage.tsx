import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import ReadingStatusPicker from '@/components/picker/ReadingStatusPicker'
import TopBar from '@/components/TopBar'
import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/helpers/types'
import { dbGetManhwasByReadingStatus } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const Library = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  
  const status = useRef('Reading')
  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    setLoading(true)
      const m = await dbGetManhwasByReadingStatus(db, status.current, 0, AppConstants.PAGE_LIMIT)
      hasResults.current = m.length > 0
      setManhwas(m)
    setLoading(false)
  }

  const load = async (append: boolean = false) => {
    setLoading(true)
      const m = await dbGetManhwasByReadingStatus(
        db,
        status.current,
        page.current * AppConstants.PAGE_LIMIT,
        AppConstants.PAGE_LIMIT
      )
      hasResults.current = m.length > 0
      setManhwas(prev => append ? [...prev, ...m] : m)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const onChangeValue = async (value: string | null) => {
    if (!value) { return }
    status.current = value
    page.current = 0
    await load()
  }

  const onEndReached = async () => {
    if (!hasResults.current) { return }
    page.current += 1
    await load(true)
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
        <TopBar title='Library'>
          <ReturnButton/>
        </TopBar>
        <View style={{flex: 1, gap: AppConstants.GAP}} >
          <ReadingStatusPicker onChangeValue={onChangeValue}/>
          <ManhwaGrid
            manhwas={manhwas}
            loading={loading}
            showChaptersPreview={false}
            showManhwaStatus={false}
            onEndReached={onEndReached}
          />
        </View>
    </SafeAreaView>
  )
}

export default Library
