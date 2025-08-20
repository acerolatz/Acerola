import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { useCallback, useEffect, useMemo, useState } from "react"
import ChapterPageSelector from "../chapter/ChapterPageSelector"
import ChapterGridItem from "../chapter/ChapterGridItem"
import { dbGetManhwaReadChapters } from '@/lib/database'
import { AppConstants } from "@/constants/AppConstants"
import { useChapterState } from "@/store/chapterState"
import { router, useFocusEffect } from "expo-router"
import { Typography } from "@/constants/typography"
import { spFetchChapterList } from "@/lib/supabase"
import { useSQLiteContext } from "expo-sqlite"
import { AppStyle } from "@/styles/AppStyle"
import { Colors } from "@/constants/Colors"
import { Manhwa } from '@/helpers/types'
import Row from "../util/Row"


const PAGE_LIMIT = 96


interface ManhwaChapterGridProps {
  manhwa: Manhwa  
}


const ManhwaChapterGrid = ({ manhwa }: ManhwaChapterGridProps) => {
  
  const db = useSQLiteContext()
  const manhwa_id = manhwa.manhwa_id
  const { chapters, setChapters, setCurrentChapterIndex } = useChapterState()

  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
    
  const [chaptersReadSet, setChaptersReadSet] = useState<Set<number>>(new Set())

  const maxChapterPageNum = useMemo(() => Math.floor(chapters.length / PAGE_LIMIT), [chapters.length])

  // Fetch chapters
  useEffect(() => {
    let isCancelled = false
    const init = async () => {
      setLoading(true)
      const c = await spFetchChapterList(manhwa_id)
      if (!isCancelled) {
        setChapters(c)
        setCurrentPage(0)
      }
      setLoading(false)
    }
    init()
    return () => { isCancelled = true }
  }, [manhwa_id, setChapters])

  // Fetch read chapters on focus
  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        const r = await dbGetManhwaReadChapters(db, manhwa_id)
        setChaptersReadSet(r)
      }
      reload()
    }, [db, manhwa_id])
  )
  
  const navigateToChapter = useCallback((index: number) => {
    setCurrentChapterIndex(index)
    router.navigate({
      pathname: "/(pages)/ChapterPage",
      params: { manhwaTitle: manhwa.title }
    })
  }, [manhwa.title, setCurrentChapterIndex])

  const readFirst = useCallback(() => {
    if (chapters.length > 0) navigateToChapter(0)
  }, [chapters.length, navigateToChapter])

  const readLast = useCallback(() => {
    if (chapters.length > 0) navigateToChapter(chapters.length - 1)
  }, [chapters.length, navigateToChapter])

  const moveToNextChapterPage = useCallback(() => {
    setCurrentPage(prev => prev >= maxChapterPageNum ? 0 : prev + 1)
  }, [maxChapterPageNum])

  const moveToPreviousChapterPage = useCallback(() => {
    setCurrentPage(prev => prev === 0 ? maxChapterPageNum : prev - 1)
  }, [maxChapterPageNum])

  const displayedChapters = useMemo(
    () => chapters.slice(currentPage * PAGE_LIMIT, (currentPage + 1) * PAGE_LIMIT),
    [chapters, currentPage]
  )

  if (loading) {
    return (
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <ActivityIndicator size={AppConstants.ICON.SIZE} color={manhwa.color} />
      </View>
    )
  }  

  if (!manhwa || chapters.length === 0) { return <></> }

  return (    
    <View style={styles.container} >
      <Row style={{gap: AppConstants.MARGIN}} >
        <Pressable onPress={readFirst} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={{...Typography.regular, color: Colors.backgroundColor}}>Read First</Text>
        </Pressable>
        <Pressable onPress={readLast} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={{...Typography.regular, color: Colors.backgroundColor}}>Read Last</Text>
        </Pressable>
      </Row>
      
      <ChapterPageSelector
        currentPage={currentPage}
        numChapters={chapters.length}
        backgroundColor={manhwa.color}
        moveToNextChapterPage={moveToNextChapterPage}
        moveToPreviousChapterPage={moveToPreviousChapterPage}
      />
      
      <View style={styles.chapterGrid}>
        {
          displayedChapters.map(( item, index ) => 
            <ChapterGridItem
              key={item.chapter_id}
              manhwaColor={manhwa.color}
              index={currentPage * PAGE_LIMIT + index}
              onPress={navigateToChapter}
              chapterName={item.chapter_name}
              isReaded={chaptersReadSet.has(item.chapter_id)}
            />
          )
        }
      </View>
    </View>
  )
}

export default ManhwaChapterGrid;

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    gap: AppConstants.MARGIN, 
    flexWrap: 'wrap', 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "center"
  },
  chapterGrid: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
    gap: AppConstants.MARGIN,
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },  
  button: {
    flex: 1,     
    height: 52, 
    borderRadius: AppConstants.BORDER_RADIUS, 
    alignItems: "center", 
    justifyContent: "center"
  }
})