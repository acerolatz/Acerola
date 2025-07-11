import ChapterArrowUpButton from '@/components/buttons/ChapterArrowUpButton'
import ChapterFooter from '@/components/chapter/ChapterFooter'
import ChapterHeader from '@/components/chapter/ChapterHeader'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'


const MAX_WIDTH = wp(100)


const ChapterPage = () => {
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const mangaTitle = params.mangaTitle as string
    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flashListRef = useRef<FlashList<ChapterImage>>(null)

    const currentChapter: Chapter = chapters[currentChapterIndex]    

    useEffect(
      () => {
        async function load() {
          if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
          return
        }
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs = await spFetchChapterImages(currentChapter.chapter_id)
          Image.prefetch(imgs.slice(0, 3).map((i) => i.image_url))
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

    const renderItem = ({item}: {item: ChapterImage}) => {
      const width = Math.min(item.width, MAX_WIDTH)
      const height = (width * item.height) / item.width
      return (    
        <Image 
          style={{ width, height }} 
          source={item.image_url} 
          contentFit="cover"
        />      
      )
    }    

    return (
        <View style={styles.container} >          
            <FlashList
              data={images}
              ref={flashListRef}
              keyExtractor={(item) => item.image_url}
              renderItem={renderItem}
              estimatedItemSize={hp(50)}
              scrollEventThrottle={4}
              drawDistance={hp(300)}
              onEndReachedThreshold={3}
              ListHeaderComponent={
                <ChapterHeader
                mangaTitle={mangaTitle}
                currentChapter={currentChapter}
                loading={loading}
                goToNextChapter={goToNextChapter}
                goToPreviousChapter={goToPreviousChapter}
              />
              }
              ListFooterComponent={
                <ChapterFooter
                  mangaTitle={mangaTitle}
                  currentChapter={currentChapter}
                  loading={loading}
                  goToNextChapter={goToNextChapter}
                  goToPreviousChapter={goToPreviousChapter}
                />
              }
              ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
            />                    
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