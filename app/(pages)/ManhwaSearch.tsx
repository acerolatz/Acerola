import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/buttons/ReturnButton'
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
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

  const [isPending, startTransition] = useTransition()
  const flatListRef = useRef<FlatList<Manhwa>>(null)  
  const fetchingOnEndReached = useRef(false)
  const isInitialized = useRef(false)
  const hasResults = useRef(true)
  const searchTerm = useRef('')
  
  useEffect(
    () => {
      const init = async () => {
        setLoading(true)
        try {
          const m = await dbSearchMangas(db, searchTerm.current, 0, AppConstants.PAGE_LIMIT)
          setManhwas(m)
          hasResults.current = m.length >= AppConstants.PAGE_LIMIT
          isInitialized.current = true
        } finally {
          setLoading(false)
        }
      }
      init()
    },
    [db]
  )

  const handleSearch = useCallback(async (value: string) => {
    setLoading(true)
    try {
      searchTerm.current = value.trim()
      page.current = 0
      const m = await dbSearchMangas(
        db, 
        searchTerm.current, 
        0, 
        AppConstants.PAGE_LIMIT
      )
      startTransition(() => { setManhwas(m) })
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
      flatListRef.current?.scrollToIndex({animated: false, index: 0})
    } finally {
      setLoading(false)
    }
  }, [db])

  const debounceSearch = useMemo(() => debounce(handleSearch, 400), [db])

  const onEndReached = useCallback(async () => {
    if (
      fetchingOnEndReached.current || 
      !hasResults.current || 
      !isInitialized.current
    ) { return }
    fetchingOnEndReached.current = true
    try {
      page.current += 1
      const m: Manhwa[] = await dbSearchMangas(
        db, 
        searchTerm.current, 
        page.current * AppConstants.PAGE_LIMIT, 
        AppConstants.PAGE_LIMIT
      )
      startTransition(() => { setManhwas(prev => [...prev, ...m]) })
      hasResults.current = m.length >= AppConstants.PAGE_LIMIT
    } finally {
      fetchingOnEndReached.current = false
    }
  }, [db])

  const renderFooter = useCallback(() => {
    if ((loading || isPending) && hasResults.current) {
      return (
        <View style={styles.footer} >
          <CustomActivityIndicator/>
        </View>
      )
    }
    return <Footer/>
  }, [loading, isPending])

  const renderItem = useCallback(({item}: {item: Manhwa}) => (
    <ManhwaCard
      showChaptersPreview={false} 
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
        <FlatList
          keyboardShouldPersistTaps={'handled'}
          ref={flatListRef}
          data={manhwas}
          numColumns={2}
          keyExtractor={keyExtractor}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={100}
          onEndReachedThreshold={2}
          windowSize={5}
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
