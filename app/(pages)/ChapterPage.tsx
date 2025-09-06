import { dbAddNumericInfo, dbUpsertManhwaReadingHistory } from '@/lib/database'
import { spFetchChapterImages, spUpdateChapterView } from '@/lib/supabase'
import ChapterReader from '@/app/components/chapter/ChapterReader'
import ChapterHeader from '@/app/components/chapter/ChapterHeader'
import React, { useEffect, useMemo, useState } from 'react'
import { Chapter, ChapterImage } from '@/helpers/types'
import { useChapterState } from '@/hooks/chapterState'
import { ToastMessages } from '@/constants/Messages'
import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { Image } from 'expo-image'


const ChapterPage = () => {  
  
  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manhwaTitle = params.manhwaTitle as string

  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)  

  const chapters = useChapterState(s => s.chapters)
  const currentChapterIndex = useChapterState(s => s.currentChapterIndex)
  const currentChapter: Chapter = chapters[currentChapterIndex]  

  const reloadChapter = async () => {
    if (loading) { return }
    Toast.show(ToastMessages.EN.RELOADING_CHAPTER)
    setLoading(true)
      const [imgs, ] = await Promise.all([
        spFetchChapterImages(currentChapter.chapter_id),
        Image.clearMemoryCache()
      ])
      if (imgs.length === 0) {
        setLoading(false);
        Toast.show(ToastMessages.EN.COULD_NOT_FETCH_CHAPTER_IMAGES)
        return
      }
      await Image.prefetch(imgs.slice(0, 5).map(i => i.image_url), 'disk')
      setImages(imgs)
    setLoading(false)
  }

  useEffect(
    () => {
      let isCancelled = false;
      if (
        currentChapterIndex < 0 || 
        currentChapterIndex >= chapters.length
      ) { return }
      async function init() {
        setLoading(true)
          const [imgs, ] = await Promise.all([
            spFetchChapterImages(currentChapter.chapter_id),
            Image.clearMemoryCache()
          ])

          if (imgs.length === 0) { 
            setImages([])
            setLoading(false)
            return
          }

          if (isCancelled) { return }

          await Promise.all([
            dbUpsertManhwaReadingHistory(db, currentChapter.manhwa_id, currentChapter.chapter_id),
            spUpdateChapterView(currentChapter.chapter_id),
            dbAddNumericInfo(db, 'images', imgs.length),
            Image.prefetch(imgs.slice(0, 4).map(i => i.image_url), 'disk')
          ])

          setImages(imgs)
        setLoading(false)
      }

      init()
      return () => { isCancelled = true; };
  }, [db, currentChapterIndex])  

  const data = useMemo(() => {
    if (loading) return []; return images
  }, [loading, images])

  const listHeader = useMemo(() => (
    <ChapterHeader
      manhwa_id={currentChapter.manhwa_id}
      reloadChapter={reloadChapter}
      manhwaTitle={manhwaTitle}
      loading={loading}
    />
  ), [reloadChapter, manhwaTitle, loading])  

  return (
    <View style={styles.container} >
      <ChapterReader 
        images={data}          
        manhwaTitle={manhwaTitle}
        listHeader={listHeader}
        loading={loading}
      />
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