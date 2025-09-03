import ReadingStatusPicker from '@/app/components/picker/ReadingStatusPicker'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import { dbReadManhwasByReadingStatus } from '@/lib/database'
import React, { useCallback, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaGrid from '@/app/components/grid/ManhwaGrid'
import { SafeAreaView, View } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { useFocusEffect } from 'expo-router'
import TopBar from '@/app/components/TopBar'
import { Manhwa } from '@/helpers/types'


const Library = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
    
  const status = useRef('Reading')

  const init = async () => {
    setLoading(true)
      const m = await dbReadManhwasByReadingStatus(db, status.current)
      setManhwas(m)
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
    init()
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
        <TopBar title='Library'>
          <ReturnButton/>
        </TopBar>
        <View style={{flex: 1, gap: AppConstants.UI.GAP}} >
          <ReadingStatusPicker onChangeValue={onChangeValue} isActive={!loading}/>
          <ManhwaGrid manhwas={manhwas} showManhwaStatus={false} />
        </View>
    </SafeAreaView>
  )
}

export default Library