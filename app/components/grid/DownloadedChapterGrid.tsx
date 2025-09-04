
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
import { Chapter, DownloadRecord, Manhwa } from '@/helpers/types'
import Row from "../util/Row"
import React from 'react'


const PAGE_LIMIT = 96


interface ManhwaChapterGridProps {
    chapters: DownloadRecord[]
    manhwa: Manhwa
}


const DownloadedChapterGrid = ({ manhwa, chapters }: ManhwaChapterGridProps) => {
  
  const db = useSQLiteContext()
  const manhwa_id = manhwa.manhwa_id  

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

  if (!manhwa || chapters.length === 0) { return <></> }

  return (    
    <View style={styles.container} >      
      <View style={styles.chapterGrid}>
        {
          chapters.map(( item, index ) => 
            <ChapterGridItem
              key={item.chapter_id}
              manhwaColor={manhwa.color}
              index={currentPage * PAGE_LIMIT + index}
              onPress={() => {}}
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
