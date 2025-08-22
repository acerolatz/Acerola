import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/buttons/ReturnButton'
import { AppConstants } from '@/constants/AppConstants'
import ManhwaCard from '@/components/ManhwaCard'
import { dbSearchManhwas } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import SearchBar from '@/components/SearchBar'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'
import { debounce } from 'lodash'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { hp } from '@/helpers/util'


const ManhwaSearch = () => {
  
  const db = useSQLiteContext()
  
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const flatListRef = useRef<FlashListRef<Manhwa>>(null) 

  const searchTerm = useRef('')
  const manhwasRef = useRef<Manhwa[]>([])
  const fetching = useRef(false)
  const hasResults = useRef(true)
  const isMounted = useRef(true)
  const page = useRef(0)
  
  useEffect(() => {
    isMounted.current = true
    const init = async () => {
      const m = await dbSearchManhwas(db, searchTerm.current, 0, AppConstants.PAGE_LIMIT)
      if (!isMounted.current) { return }
      setManhwas(m)
      manhwasRef.current = m
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    }
    init()
    return () => { isMounted.current = false }
    },[db]
  )

  const handleSearch = useCallback(async (value: string) => {
    searchTerm.current = value.trim()
    page.current = 0
    const m = await dbSearchManhwas(
      db, 
      searchTerm.current, 
      0, 
      AppConstants.PAGE_LIMIT
    )
    if (isMounted.current) {
      manhwasRef.current = m
      setManhwas([...manhwasRef.current])
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
      flatListRef.current?.scrollToIndex({animated: false, index: 0})
    }
  }, [db])

  const debounceSearch = useMemo(() => debounce(handleSearch, 400), [db])

  const onEndReached = useCallback(async () => {
    if (fetching.current || !hasResults.current) { return }
    fetching.current = true    
    page.current += 1
    const m: Manhwa[] = await dbSearchManhwas(
      db, 
      searchTerm.current, 
      page.current * AppConstants.PAGE_LIMIT, 
      AppConstants.PAGE_LIMIT
    )
    if (isMounted.current && m.length) {
      manhwasRef.current.push(...m)
      setManhwas([...manhwasRef.current])
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    }
    fetching.current = false
  }, [db])

  const renderFooter = useCallback(() => { return <Footer/> }, [])

  const renderItem = useCallback(({item}: {item: Manhwa}) => (
    <ManhwaCard      
      width={AppConstants.MANHWA_COVER.WIDTH} 
      height={AppConstants.MANHWA_COVER.HEIGHT}
      marginBottom={AppConstants.GAP / 2}
      manhwa={item}      
    />
  ), [])

  const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' > 
        <ReturnButton />
      </TopBar>
      <View style={styles.container} >
        <SearchBar onChangeText={debounceSearch} placeholder='pornhwa' />
        <FlashList
          keyboardShouldPersistTaps={'handled'}
          ref={flatListRef}
          data={manhwas}
          numColumns={2}
          keyExtractor={keyExtractor}
          onEndReachedThreshold={2}
          drawDistance={hp(250)}
          onEndReached={onEndReached}          
          renderItem={renderItem}
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
