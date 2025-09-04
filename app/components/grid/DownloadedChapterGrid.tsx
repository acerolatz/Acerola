import { Pressable, StyleSheet, Text, View } from "react-native"
import ChapterPageSelector from "../chapter/ChapterPageSelector"
import ChapterGridItem from "../chapter/ChapterGridItem"
import { dbGetManhwaReadChapters } from '@/lib/database'
import { AppConstants } from "@/constants/AppConstants"
import { useChapterState } from "@/hooks/chapterState"
import { useCallback, useMemo, useState } from "react"
import { router, useFocusEffect } from "expo-router"
import { Typography } from "@/constants/typography"
import { useSQLiteContext } from "expo-sqlite"
import { AppStyle } from "@/styles/AppStyle"
import { Manhwa } from '@/helpers/types'
import Row from "../util/Row"
import React from 'react'


const PAGE_LIMIT = 96


interface ManhwaChapterGridProps {
  manhwa: Manhwa
}


const DownloadedChapterGrid = ({ manhwa }: ManhwaChapterGridProps) => {
  
  const db = useSQLiteContext()
  const manhwa_id = manhwa.manhwa_id  

  const setCurrentChapterIndex = useChapterState(c => c.setCurrentChapterIndex)
  const chapters = useChapterState(c => c.chapters)

  const [currentPage, setCurrentPage] = useState(0)
  const [chaptersReadSet, setChaptersReadSet] = useState<Set<number>>(new Set())

  const maxChapterPageNum = useMemo(() => Math.floor(chapters.length / PAGE_LIMIT), [chapters.length])
  
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
      pathname: "/(pages)/DownloadedChapterPage",
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

  if (!manhwa || chapters.length === 0) { return <></> }

  return (    
    <View style={styles.container} >
      <Row style={{gap: AppConstants.UI.MARGIN}} >
        <Pressable onPress={readFirst} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={Typography.regularBlack}>Read First</Text>
        </Pressable>
        <Pressable onPress={readLast} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={Typography.regularBlack}>Read Last</Text>
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

export default DownloadedChapterGrid;

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    gap: AppConstants.UI.MARGIN, 
    flexWrap: 'wrap', 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "center"
  },
  chapterGrid: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
    gap: AppConstants.UI.MARGIN,
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },  
  button: {
    flex: 1,     
    height: 52, 
    borderRadius: AppConstants.UI.BORDER_RADIUS, 
    alignItems: "center", 
    justifyContent: "center"
  }
})
