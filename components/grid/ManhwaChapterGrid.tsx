import { Colors } from "@/constants/Colors"
import { Manhwa } from '@/helpers/types'
import { dbGetManhwaReadChapters } from '@/lib/database'
import { spFetchChapterList } from "@/lib/supabase"
import { useChapterState } from "@/store/chapterState"
import { AppStyle } from "@/styles/AppStyle"
import { router, useFocusEffect } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import Row from "../util/Row"
import { AppConstants } from "@/constants/AppConstants"
import { wp } from "@/helpers/util"
import { Typography } from "@/constants/typography"
import ChapterPageSelector from "../chapter/ChapterPageSelector"
import ChapterGridItem from "../chapter/ChapterGridItem"


const PAGE_LIMIT = 96


interface ManhwaChapterGridProps {
  manhwa: Manhwa
  textColor?: string
}


const ManhwaChapterGrid = ({  
  manhwa,
  textColor = Colors.backgroundColor
}: ManhwaChapterGridProps) => {
  
  const db = useSQLiteContext()
  const manhwa_id = manhwa.manhwa_id
  const { chapters, setChapters, setCurrentChapterIndex } = useChapterState()

  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
    
  const [chaptersReadSet, setChaptersReadSet] = useState<Set<number>>(new Set())
  const maxChapterPageNum = Math.floor(chapters.length / PAGE_LIMIT)  

  useEffect(
    () => {
      let isCancelled = false

      async function init() {
        setLoading(true)
          const c = await spFetchChapterList(manhwa_id)
          if (isCancelled) { return }
          setCurrentPage(0)
          setChapters(c)
        setLoading(false)
      }

      init()
      return () => { isCancelled = true }
    },
    [manhwa_id]
  )

  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        const r = await dbGetManhwaReadChapters(db, manhwa_id)
        setChaptersReadSet(r)
      }
      reload()      
    }, [db, manhwa_id])
  )
  
  const readFirst = () => {
    if (chapters.length > 0) {
      setCurrentChapterIndex(0)
      router.navigate({
        pathname: "/(pages)/ChapterPage",
        params: {
          manhwaTitle: manhwa.title
        }
      })
    }
  }

  const readLast = () => {
    if (chapters.length > 0) {
      setCurrentChapterIndex(chapters.length - 1)
      router.navigate({
        pathname: "/(pages)/ChapterPage",
        params: {
          manhwaTitle: manhwa.title
        }
      })
    }
  }

  const readChapter = useCallback((index: number) => {
    setCurrentChapterIndex(index)
    router.navigate({
      pathname: "/(pages)/ChapterPage", 
      params: {
        manhwaTitle: manhwa.title
      }
    })
  }, [manhwa_id])

  const moveToNextChapterPage = () => {
    setCurrentPage(prev => prev > maxChapterPageNum - 1 ? 0 : prev + 1)
  }

  const moveToPreviousChapterPage = () => {
    setCurrentPage(prev => prev === 0 ? prev = maxChapterPageNum : prev - 1)
  }

  if (loading) {
    return (
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <ActivityIndicator size={AppConstants.ICON.SIZE} color={manhwa.color} />
      </View>
    )
  }  

  if (!manhwa || chapters.length === 0) {
    return <></>
  }

  return (    
    <View style={styles.container} >
      <Row style={{gap: AppConstants.MARGIN}} >
        <Pressable onPress={readFirst} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={{...Typography.regular, color: textColor}}>Read First</Text>
        </Pressable>
        <Pressable onPress={readLast} style={{...AppStyle.button, backgroundColor: manhwa.color}}>
          <Text style={{...Typography.regular, color: textColor}}>Read Last</Text>
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
          chapters.slice(currentPage * PAGE_LIMIT, (currentPage + 1) * PAGE_LIMIT).map(( item, index ) => 
            <ChapterGridItem
              manhwaColor={manhwa.color}
              index={currentPage * PAGE_LIMIT + index}
              onPress={readChapter}
              key={item.chapter_id}
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