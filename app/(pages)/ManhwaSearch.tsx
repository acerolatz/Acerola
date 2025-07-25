import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbSearchMangas } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const PAGE_LIMIT = 30


const ManhwaSearch = () => {
  
  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const searchTerm = useRef('')  
  
  useEffect(
    () => {
      let isCancelled = false
      const init = async () => {
        if (manhwas.length == 0) {
          setLoading(true)
            const m = await dbSearchMangas(db, searchTerm.current, 0, PAGE_LIMIT)
            if (isCancelled) { return }
            hasResults.current = m.length > 0
            setManhwas(m)
          setLoading(false)
        }
        isInitialized.current = true
      }
      init()
      return () => {
        isCancelled = true
      }
    },
    []
  )

  const handleSearch = async (value: string) => {
    searchTerm.current = value.trim()
    page.current = 0
    setLoading(true)
        const m = await dbSearchMangas(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
        hasResults.current = m.length > 0
        setManhwas(m)
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await dbSearchMangas(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' titleColor={Colors.yellow} > 
        <ReturnButton color={Colors.yellow} />
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <SearchBar onChangeValue={debounceSearch} color={Colors.yellow} placeholder='manhwa' />
        <ManhwaGrid
          manhwas={manhwas}
          numColumns={2}
          showChaptersPreview={false}
          hasResults={hasResults.current}
          loading={loading}
          onEndReached={onEndReached}
        />        
      </View>
    </SafeAreaView>
  )
}

export default ManhwaSearch
