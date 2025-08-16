import ChapterArrowUpButton from '@/components/buttons/ChapterArrowUpButton'
import ChapterFooter from '@/components/chapter/ChapterFooter'
import ChapterHeader from '@/components/chapter/ChapterHeader'
import ChapterImageItem from '@/components/chapter/ChapterImageItem'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { dbAddNumericInfo, dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages, spUpdateChapterView } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { useSettingsState } from '@/store/settingsState'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import Toast from 'react-native-toast-message'


const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ChapterImage>)


const ChapterPage = () => {

    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const manhwaTitle = params.manhwaTitle as string

    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()

    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flashListRef = useRef<FlashList<ChapterImage>>(null)
    
    const [listTotalHeight, setListTotalHeight] = useState(hp(40))
  
    const drawDistance = useSettingsState(s => s.settings.drawDistance)
    const onEndReachedThreshold = useSettingsState(s => s.settings.onEndReachedThreshold)    

    const currentChapter: Chapter = chapters[currentChapterIndex] 
    const headerVisible = useSharedValue(true)
    const footerVisible = useSharedValue(false)
    const listTotalHeightRef = useSharedValue(hp(100))
    const isLastChapter= currentChapterIndex >= chapters.length - 1
    const isFirstChapter= currentChapterIndex === 0  

    const calculateTotalHeight = (imgs: ChapterImage[]) => {
        let newHeight = 0
        imgs.forEach(img => {
          const w = Math.min(img.width, AppConstants.COMMON.SCREEN_WIDTH)
          const h = (w * img.height) / img.width
          newHeight += h              
        })
        setListTotalHeight(imgs.length > 0 ? newHeight / imgs.length : hp(40))            
        listTotalHeightRef.value = newHeight + AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT
    }

    const reloadChapter = async () => {
      if (loading) { return }
      Toast.show({text1: "Reloading chapter...", type: 'info'})
      setImages([])
      setLoading(true)
        const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)
        if (imgs.length === 0) { setLoading(false); return }
        await Image.prefetch(imgs.slice(0, 5).map(i => i.image_url))
        calculateTotalHeight(imgs)
        setImages(imgs)
        footerVisible.value = false
      setLoading(false)
    }

    useEffect(
      () => {
        let isCancelled = false;
        if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
          return
        }

        async function load() {
          setLoading(true)
            const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)
            if (imgs.length === 0) { setImages([]); setLoading(false); return }            
            
            if (isCancelled) return;

            await Image.clearMemoryCache();
            await Promise.all([
              dbUpsertReadingHistory(db, currentChapter.manhwa_id, currentChapter.chapter_id),
              dbAddNumericInfo(db, 'images', imgs.length),
              Image.prefetch(imgs.slice(0, 5).map(i => i.image_url))
            ])

            spUpdateChapterView(currentChapter.chapter_id)
            calculateTotalHeight(imgs)
            setImages(imgs)
            footerVisible.value = false
          setLoading(false)
        }

        load()
        return () => { isCancelled = true; };
    }, [currentChapterIndex, chapters, db])    
    
    const scrollToTop = () => {
      flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
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
        footerVisible.value = event.contentOffset.y + AppConstants.COMMON.SCREEN_HEIGHT >= listTotalHeightRef.value - 100
      }
    })

    const animatedHeaderStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          { translateY: withTiming(headerVisible.value ? 0 : -AppConstants.PAGES.CHAPTER.HEADER_HEIGHT, { duration: 600 }) }
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
          { translateY: withTiming(footerVisible.value ? -AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT * 1.5: AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT, { duration: 600 }) }
        ],
        opacity: withTiming(footerVisible.value ? 1 : 0),
        zIndex: 10,
        width: '100%',
        position: 'absolute',
        bottom: -AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT,
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
      return <ChapterImageItem item={item} />
    }

    return (
        <View style={styles.container} >          
          <Animated.View style={animatedHeaderStyle} > 
            <ChapterHeader
              reloadChapter={reloadChapter}
              isFirstChapter={isFirstChapter}
              isLastChapter={isLastChapter}
              mangaTitle={manhwaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
          <AnimatedFlashList
            data={ loading ? [] : [...['BoxHeader'], ...images, ...['BoxFooter']] as any }
            ref={flashListRef}
            keyExtractor={keyExtractor}
            estimatedItemSize={listTotalHeight}
            renderItem={renderItem}
            drawDistance={drawDistance}
            scrollEventThrottle={4}
            onScroll={scrollHandler}
            onEndReachedThreshold={onEndReachedThreshold}
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