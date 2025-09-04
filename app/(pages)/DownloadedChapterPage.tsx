import { dbAddNumericInfo, dbUpsertManhwaReadingHistory } from '@/lib/database'
import ChapterHeader from '@/app/components/chapter/ChapterHeader'
import ChapterReader from '@/app/components/chapter/ChapterReader'
import { ChapterImage, DownloadRecord } from '@/helpers/types'
import React, { useEffect, useMemo, useState } from 'react'
import { spUpdateChapterView } from '@/lib/supabase'
import { useChapterState } from '@/hooks/chapterState'
import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { Image } from 'expo-image'
import { readDirImages } from '@/helpers/storage'


const DownloadedChapterPage = () => {  
  
  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manhwaTitle = params.manhwaTitle as string

  const chapters: DownloadRecord[] = useChapterState(s => s.chapters) as any
  const currentChapterIndex = useChapterState(s => s.currentChapterIndex)

  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)  

  const currentChapter: DownloadRecord = chapters[currentChapterIndex]

  useEffect(
    () => {
      let isCancelled = false;
      if (
        currentChapterIndex < 0 || 
        currentChapterIndex >= chapters.length
      ) { return }
      async function init() {
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs: ChapterImage[] = await readDirImages(currentChapter.path)

          if (imgs.length === 0) { 
            setImages([])
            setLoading(false)
            return
          }

          if (isCancelled) return

          await Promise.all([
            dbUpsertManhwaReadingHistory(db, currentChapter.manhwa_id, currentChapter.chapter_id),
            spUpdateChapterView(currentChapter.chapter_id),
            dbAddNumericInfo(db, 'images', imgs.length)            
          ])

          setImages(imgs)
        setLoading(false)
      }

      init()
      return () => { isCancelled = true; };
  }, [db, currentChapterIndex])  

  const data = useMemo(() => {
    if (loading) return []; 
    return images
  }, [loading, images])

  const listHeader = useMemo(() => (
    <ChapterHeader
      manhwa_id={currentChapter.manhwa_id}
      manhwaTitle={manhwaTitle}
      loading={loading}
      showDownloadButton={false}
    />
  ), [manhwaTitle, loading])  

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


export default DownloadedChapterPage


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black
  }
}) 