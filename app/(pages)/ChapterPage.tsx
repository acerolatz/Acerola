import { spFetchChapterImages, spUpdateChapterView } from '@/lib/supabase'
import { dbAddNumericInfo, dbUpsertManhwaReadingHistory } from '@/lib/database'
import ChapterReader from '@/components/chapter/ChapterReader'
import ChapterHeader from '@/components/chapter/ChapterHeader'
import React, { useEffect, useMemo, useState } from 'react'
import { Chapter, ChapterImage } from '@/helpers/types'
import { useChapterState } from '@/store/chapterState'
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

  const chapters = useChapterState(s => s.chapters)
  const currentChapterIndex = useChapterState(s => s.currentChapterIndex)  

  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)  

  const currentChapter: Chapter = chapters[currentChapterIndex]

  const reloadChapter = async () => {
    if (loading) { return }
    Toast.show({text1: "Reloading chapter...", type: 'info'})
    setImages([])
    setLoading(true)
      await Image.clearMemoryCache();
      const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)
      if (imgs.length === 0) { 
        setLoading(false);
        Toast.show({text1: "Error", text2: "Could not fetch the chapter images", type: 'info'})
        return 
      }
      await Image.prefetch(imgs.slice(0, 5).map(i => i.image_url))
      setImages(imgs)
    setLoading(false)
  }

  useEffect(
    () => {
      let isCancelled = false;
      if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
        return
      }
      async function init() {
        setLoading(true)
          await Image.clearMemoryCache();
          const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)
          if (imgs.length === 0) { setImages([]); setLoading(false); return }
          if (isCancelled) return;
          await Promise.all([
            dbUpsertManhwaReadingHistory(db, currentChapter.manhwa_id, currentChapter.chapter_id),
            spUpdateChapterView(currentChapter.chapter_id),
            dbAddNumericInfo(db, 'images', imgs.length),
            Image.prefetch(imgs.slice(0, 5).map(i => i.image_url))
          ])
          setImages(imgs)
        setLoading(false)
      }

      init()
      return () => { isCancelled = true; };
  }, [db, currentChapterIndex])  

  const data = useMemo(() => {
    if (loading) return []
    return images
  }, [loading, images])

  const listHeader = useMemo(() => (
    <ChapterHeader
      reloadChapter={reloadChapter}
      mangaTitle={manhwaTitle}
      loading={loading}
    />
  ), [reloadChapter, manhwaTitle, loading])  

  return (
    <View style={styles.container} >
      <ChapterReader 
        images={data}
        manhwaTitle={manhwaTitle}
        loading={loading}
        listHeader={listHeader}        
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