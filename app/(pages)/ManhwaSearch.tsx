import ReturnButton from '@/components/buttons/ReturnButton'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { dbHasManhwa, dbUpsertManhwa } from '@/lib/database'
import { spSearchManhwas } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { memo, useEffect, useRef, useState } from 'react'
import { Pressable, SafeAreaView, Text, View } from 'react-native'


const PAGE_LIMIT = 20


const {width, height} = getItemGridDimensions(
    wp(5),
    10,
    2,
    AppConstants.MANHWA_COVER_DIMENSION.width,
    AppConstants.MANHWA_COVER_DIMENSION.height
)


const Item = memo(({item, onPress}: {item: Manhwa, onPress: (manhwa: Manhwa) => void}) => {
    
    const mangaStatusColor = item.status === "Completed" ? 
        Colors.ononokiGreen : 
        Colors.orange

    return (
      <Pressable style={{width, marginRight: 10, gap: 10, marginBottom: 10}} onPress={() => onPress(item)} >
        <Image 
            source={item.cover_image_url} 
            contentFit='cover'
            cachePolicy={'disk'}
            style={[{borderRadius: 12, width, height}]}/>
        <View>
            <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{item.title}</Text>
        </View>
        <View style={{position: 'absolute', left: 8, top: 8, borderRadius: 12, backgroundColor: mangaStatusColor, paddingVertical: 6, paddingHorizontal: 8}} >
          <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor, fontSize: 12}]}>{item.status}</Text>
        </View>
        {
          AppConstants.DEBUG_MODE &&
          <View style={{position: 'absolute', right: 6, top: 6, borderRadius: 12, width: 42, height: 42, backgroundColor: Colors.backgroundColor, alignItems: "center", justifyContent: "center"}} >
              <Text style={AppStyle.textRegular}>{item.manhwa_id}</Text>
          </View>
        }
      </Pressable>
    )
})


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
            const m = await spSearchManhwas(searchTerm.current, 0, PAGE_LIMIT)
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
        const m = await spSearchManhwas(searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)        
        hasResults.current = m.length > 0
        setManhwas(m)
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 500)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await spSearchManhwas(searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)        
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
  }  

  const onManhwaPress = async (manhwa: Manhwa) => {
    const hasManhwa = await dbHasManhwa(db, manhwa.manhwa_id)
    
    if (!hasManhwa) {
      await dbUpsertManhwa(db, manhwa)
    }
    
    router.push({
      pathname: '/(pages)/ManhwaPage', 
      params: {manhwa_id: manhwa.manhwa_id}
    })
  }

  const renderItem = ({item}: {item: Manhwa}) => {
    return <Item item={item} onPress={onManhwaPress} />
  }

  const renderFooter = () => {
    if (loading && hasResults) {
        return (
            <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                <CustomActivityIndicator/>
            </View> 
        )
    }
    return <View style={{height: 60}} />
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' titleColor={Colors.yellow} > 
        <ReturnButton color={Colors.yellow} />
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <SearchBar onChangeValue={debounceSearch} color={Colors.yellow} placeholder='manhwa' />
        <FlashList
          keyboardShouldPersistTaps={'always'}
          data={manhwas}
          numColumns={2}
          keyExtractor={(item) => item.manhwa_id.toString()}
          estimatedItemSize={200}
          drawDistance={hp(100)}
          onEndReached={onEndReached}
          scrollEventThrottle={4}
          onEndReachedThreshold={2}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          />
      </View>
    </SafeAreaView>
  )
}

export default ManhwaSearch
