import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaCard from '@/components/ManhwaCard'
import { dbSearchMangas } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import SearchBar from '@/components/SearchBar'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'
import { debounce } from 'lodash'


const ManhwaSearch = () => {
  
  const db = useSQLiteContext()
  const page = useRef(0)
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  
  const flatListRef = useRef<FlatList<Manhwa>>(null)  
  const fetchingOnEndReached = useRef(false)
  const isInitialized = useRef(false)
  const hasResults = useRef(true)
  const searchTerm = useRef('')
  
  useEffect(
    () => {
      const init = async () => {
        setLoading(true)
          const m = await dbSearchMangas(db, searchTerm.current, 0, AppConstants.PAGE_LIMIT)
          setManhwas(m)
          hasResults.current = m.length >= AppConstants.PAGE_LIMIT
          isInitialized.current = true
        setLoading(false)
      }
      init()
    },
    [db]
  )

  const handleSearch = async (value: string) => {    
    setLoading(true)
      searchTerm.current = value.trim()
      page.current = 0
      const m = await dbSearchMangas(
        db, 
        searchTerm.current, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      setManhwas(m)
    setLoading(false)
    hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    flatListRef.current?.scrollToIndex({animated: false, index: 0})
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (
      fetchingOnEndReached.current ||
      !hasResults.current || 
      !isInitialized.current
    ) { return }
    fetchingOnEndReached.current = true
    setLoading(true)
      page.current += 1
      const m: Manhwa[] = await dbSearchMangas(
        db, 
        searchTerm.current, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
    hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    fetchingOnEndReached.current = false
  }

  const renderFooter = () => {
    if (loading && hasResults) {
      return (
          <View style={styles.footer} >
              <CustomActivityIndicator/>
          </View>
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
        <FlatList
          ref={flatListRef}
          keyboardShouldPersistTaps={'handled'}
          data={manhwas}
          numColumns={2}
          keyExtractor={(item) => item.manhwa_id.toString()}
          initialNumToRender={12}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={2}
          renderItem={({item}) => <ManhwaCard
            showChaptersPreview={false} 
            width={AppConstants.MANHWA_COVER.WIDTH} 
            height={AppConstants.MANHWA_COVER.HEIGHT}
            marginBottom={AppConstants.GAP / 2}
            manhwa={item}
          />}
          ListFooterComponent={renderFooter}/>
      </View>
    </SafeAreaView>
  )
}

export default ManhwaSearch

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    gap: AppConstants.GAP
  },
  footer: {
    width: '100%', 
    marginBottom: 62, 
    marginTop: AppConstants.GAP, 
    alignItems: "center", 
    justifyContent: "center"
  }
})
