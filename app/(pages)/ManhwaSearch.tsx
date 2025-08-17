import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaCard from '@/components/ManhwaCard'
import { dbSearchMangas } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { FlashList } from '@shopify/flash-list'
import SearchBar from '@/components/SearchBar'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { debounce } from 'lodash'


const ManhwaSearch = () => {
  
  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const searchTerm = useRef('')  
  const flashListRef = useRef<FlashList<Manhwa>>(null)  
  
  useEffect(
    () => {
      let isCancelled = false
      const init = async () => {
        if (manhwas.length == 0) {
          setLoading(true)
            const m = await dbSearchMangas(db, searchTerm.current, 0, AppConstants.PAGE_LIMIT)
            if (isCancelled) { return }
            hasResults.current = m.length > 0
            setManhwas(m)
          setLoading(false)
          isInitialized.current = true
        }
      }
      init()
      return () => { isCancelled = true }
    },
    [db]
  )

  const handleSearch = async (value: string) => {
    searchTerm.current = value.trim()
    page.current = 0
    setLoading(true)
      const m = await dbSearchMangas(
        db, 
        searchTerm.current, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      hasResults.current = m.length > 0
      flashListRef.current?.scrollToIndex({animated: false, index: 0})
      setManhwas(m)
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await dbSearchMangas(
        db, 
        searchTerm.current, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
  }

  const renderFooter = () => {
      if (loading && hasResults) {
          return (
              <CustomActivityIndicator/>
          )
      }
      return <Footer/>
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' > 
        <ReturnButton />
      </TopBar>
      <View style={styles.container} >
        <SearchBar onChangeText={debounceSearch} placeholder='pornhwa' />
        <View style={styles.listContainer} >
          <FlashList
            ref={flashListRef}
            keyboardShouldPersistTaps={'always'}
            data={manhwas}
            numColumns={2}
            keyExtractor={(item) => item.manhwa_id.toString()}
            estimatedItemSize={AppConstants.MANHWA_COVER.HEIGHT}
            drawDistance={hp(100)}
            onEndReached={onEndReached}
            scrollEventThrottle={4}
            onEndReachedThreshold={0.8}
            renderItem={({item}) => <ManhwaCard 
              showChaptersPreview={false}
              showManhwaStatus={true}
              width={AppConstants.MANHWA_COVER.WIDTH}
              height={AppConstants.MANHWA_COVER.HEIGHT}
              marginBottom={AppConstants.MARGIN} 
              manhwa={item}
            />}
            ListFooterComponent={renderFooter}
            />
        </View>      
      </View>
    </SafeAreaView>
  )
}

export default ManhwaSearch

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    gap: 10
  },
  listContainer: {
    flex: 1
  }
})
