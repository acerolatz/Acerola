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
import CButton from "../buttons/CButton"
import Row from "../util/Row"
import { AppConstants } from "@/constants/AppConstants"
import { getChapterGridNumColumns, wp } from "@/helpers/util"


const PAGE_LIMIT = 96
const NUM_COLUMNS = getChapterGridNumColumns()
const ITEM_SIZE = (wp(92) - AppConstants.COMMON.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS


interface ChapterItemProps {
  isReaded: boolean
  chapterName: string
  index: number
  onPress: (index: number) => void
}


const ChapterItem = ({
  isReaded,    
  chapterName,
  index,
  onPress  
}: ChapterItemProps) => {
  const backgroundColor = isReaded ? Colors.white : Colors.gray
  const color = isReaded ? Colors.backgroundColor : Colors.white

  return (
    <Pressable
      onPress={() => onPress(index)}
      style={[styles.chapterItem, {backgroundColor}]} >
        <Text style={[AppStyle.textRegular, {color, fontSize: 14}]}>{chapterName}</Text>
    </Pressable>
  )
}


interface ChapterPageSelectorProps {
  textColor: string
  manhwaColor: string
  currentPage: number
  numChapters: number
  moveToPreviousChapterPage: () => any
  moveToNextChapterPage: () => any
}

const ChapterPageSelector = ({
  textColor,
  manhwaColor,  
  currentPage,
  moveToPreviousChapterPage,
  moveToNextChapterPage,
  numChapters
}: ChapterPageSelectorProps) => {
  return (
    <View style={{width: '100%', gap: AppConstants.COMMON.MARGIN, flexDirection: 'row'}} >
      <View style={{flex: 1, alignItems: "center", justifyContent: "center", height: 52, borderRadius: AppConstants.COMMON.BORDER_RADIUS, backgroundColor: manhwaColor}} >
          <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >Chapters: {numChapters}</Text>
      </View>
      <View style={{flex: 1, gap: AppConstants.COMMON.MARGIN, flexDirection: 'row'}} >
        <CButton 
          style={{flex: 1, height: 52, borderRadius: AppConstants.COMMON.BORDER_RADIUS, backgroundColor: manhwaColor}} 
          iconColor={textColor}
          iconName="chevron-back-outline"
          onPress={moveToPreviousChapterPage}
        />
        <View style={{flex: 1, alignItems: "center", justifyContent: "center", height: 52, borderRadius: AppConstants.COMMON.BORDER_RADIUS, borderWidth: 1, borderColor: manhwaColor}}>
          <Text style={[AppStyle.textRegular, {color: manhwaColor}]}>{currentPage + 1}</Text>
        </View>
        <CButton 
          style={{flex: 1, height: 52, borderRadius: AppConstants.COMMON.BORDER_RADIUS, backgroundColor: manhwaColor}} 
          iconColor={textColor}
          iconName="chevron-forward-outline"
          onPress={moveToNextChapterPage}
          />
      </View>
    </View>
  )
}


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
        <ActivityIndicator size={'large'} color={manhwa.color} />
      </View>
    )
  }  

  if (!manhwa || chapters.length === 0) {
    return <></>
  }

  return (    
    <View style={styles.container} >
      <Row style={{gap: 6}} >
        <Pressable onPress={readFirst} style={[styles.button, {backgroundColor: manhwa.color}]}>
          <Text style={[AppStyle.textRegular, {color: textColor}]}>Read First</Text>
        </Pressable>
        <Pressable onPress={readLast} style={[styles.button, {backgroundColor: manhwa.color}]}>
          <Text style={[AppStyle.textRegular, {color: textColor}]}>Read Last</Text>
        </Pressable>
      </Row>
      
      <ChapterPageSelector
        currentPage={currentPage}
        numChapters={chapters.length}
        manhwaColor={manhwa.color}
        textColor={textColor}              
        moveToNextChapterPage={moveToNextChapterPage}
        moveToPreviousChapterPage={moveToPreviousChapterPage}
      />

      <View style={styles.chapterGrid}>
        {
          chapters.slice(currentPage * PAGE_LIMIT, (currentPage + 1) * PAGE_LIMIT).map(( item, index ) => 
            <ChapterItem
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
    gap: 6, 
    flexWrap: 'wrap', 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "center"
  },
  chapterItem: {    
    width: ITEM_SIZE, 
    height: ITEM_SIZE, 
    borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
    alignItems: "center", 
    justifyContent: "center"    
  },
  chapterGrid: {
    width: wp(94),
    left: wp(1),
    alignItems: "center", 
    justifyContent: "flex-start",
    gap: 6,
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },
  button: {
    flex: 1,     
    height: 52, 
    borderRadius: 4, 
    alignItems: "center", 
    justifyContent: "center"
  }
})