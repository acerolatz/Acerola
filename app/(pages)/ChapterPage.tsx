import ChapterArrowUpButton from '@/components/buttons/ChapterArrowUpButton'
import ChapterFooter from '@/components/chapter/ChapterFooter'
import ChapterHeader from '@/components/chapter/ChapterHeader'
import ChapterImageItem from '@/components/chapter/ChapterImageItem'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'


const MAX_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const ChapterPage = () => {

    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const manhwaTitle = params.manhwaTitle as string
    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flatListRef = useRef<FlatList<ChapterImage>>(null)

    const currentChapter: Chapter = chapters[currentChapterIndex]    
    const headerVisible = useSharedValue(true)
    const footerVisible = useSharedValue(false)
    const flashListTotalHeight = useSharedValue(hp(100))
    const isLastChapter= currentChapterIndex >= chapters.length - 1
    const isFirstChapter= currentChapterIndex === 0

    useEffect(
      () => {
        async function load() {
          if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
            return
          }
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs = await spFetchChapterImages(currentChapter.chapter_id)          
          let newHeight = 0
          imgs.forEach(img => {
            const w = Math.min(img.width, MAX_WIDTH)
            const h = (w * img.height) / img.width
            newHeight += h
          })
          flashListTotalHeight.value = newHeight + AppConstants.CHAPTER_PAGE_FOOTER_HEIGHT
          footerVisible.value = false
          setImages(imgs)
        setLoading(false)

        dbUpsertReadingHistory(
          db,
          currentChapter.manhwa_id,
          currentChapter.chapter_id,
          currentChapter.chapter_num
        )
      }
      load()
    }, [currentChapterIndex])    
    
    const scrollToTop = () => {
      flatListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }
    
    const goToNextChapter = () => {
      if (currentChapterIndex + 1 < chapters.length) {
        setCurrentChapterIndex(currentChapterIndex + 1)
        scrollToTop()
      }
    }

    const goToPreviousChapter = () => {
      if (currentChapterIndex - 1 >= 0) {
        setCurrentChapterIndex(currentChapterIndex - 1)
        scrollToTop()
      }
    }

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        headerVisible.value = event.contentOffset.y <= 50
        footerVisible.value = event.contentOffset.y + SCREEN_HEIGHT >= flashListTotalHeight.value - 100
      }
    })

    const animatedHeaderStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          { translateY: withTiming(headerVisible.value ? 0 : -AppConstants.CHAPTER_PAGE_HEADER_HEIGHT, { duration: 600 }) }
        ],
        opacity: withTiming(headerVisible.value ? 1 : 0),
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0
      }
    })

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          { translateY: withTiming(footerVisible.value ? -AppConstants.CHAPTER_PAGE_FOOTER_HEIGHT * 1.5: AppConstants.CHAPTER_PAGE_FOOTER_HEIGHT, { duration: 600 }) }
        ],
        opacity: withTiming(footerVisible.value ? 1 : 0),
        zIndex: 10,
        width: '100%',
        position: 'absolute',
        bottom: -AppConstants.CHAPTER_PAGE_FOOTER_HEIGHT,
        left: 0
      }
    })

    const keyExtractor = (item: ChapterImage | 'BoxHeader' | 'BoxFooter'): string => {
      switch (item) {
        case "BoxHeader":
          return 'BoxHeader'
        case "BoxFooter":
          return 'BoxFooter'
        default:
          return item.image_url
      }
    }

    const renderItem = ({item}: {item: ChapterImage | 'BoxHeader' | 'BoxFooter'}) => {
      return <ChapterImageItem item={item} />;
    }

    return (
        <View style={styles.container} >          
          <Animated.View style={animatedHeaderStyle} > 
            <ChapterHeader
              isFirstChapter={isFirstChapter}
              isLastChapter={isLastChapter}
              mangaTitle={manhwaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
          <Animated.FlatList
            data={[...['BoxHeader'], ...images, ...['BoxFooter']] as any}
            ref={flatListRef}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            scrollEventThrottle={4}
            onScroll={scrollHandler}
            onEndReachedThreshold={3}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={12}
            ListEmptyComponent={<ActivityIndicator size={32} color={Colors.neonRed} />}
          />          
          <Animated.View style={animatedFooterStyle} >
            <ChapterFooter
              isFirstChapter={isFirstChapter}
              isLastChapter={isLastChapter}
              mangaTitle={manhwaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
          <ChapterArrowUpButton onPress={scrollToTop} />
        </View>
    )
}


export default ChapterPage


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.black
  }
}) 