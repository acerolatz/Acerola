import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { useChapterState } from '@/store/chapterState'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import Column from '../util/Column'
import Row from '../util/Row'
import React from 'react'
import Footer from '../util/Footer'


interface ChapterFooterProps {
  mangaTitle: string  
  loading: boolean
}


const ChapterFooter = ({
  mangaTitle,  
  loading
}: ChapterFooterProps) => {  

  const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
  const chapterName = currentChapterIndex < chapters.length ? chapters[currentChapterIndex].chapter_name : ''
  const reportTitle = `${mangaTitle}/${chapterName}`

  const isFirstChapter = currentChapterIndex === 0
  const isLastChapter = currentChapterIndex >= chapters.length - 1

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReportPage",
      params: {title: reportTitle}
    })
  }

  const goToNextChapter = () => {
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const goToPreviousChapter = () => {
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)      
    }
  }

  return (
    <Column style={styles.container} >
      <Row style={{justifyContent: "space-between"}} >
        <Row style={{gap: AppConstants.GAP, justifyContent: "flex-start"}} >
          <Text style={Typography.regular}>Chapter</Text>
          {
            !isFirstChapter &&
            <Pressable onPress={goToPreviousChapter} style={{marginTop: 2}} hitSlop={AppConstants.HIT_SLOP.NORMAL} >
              <Ionicons name='chevron-back' size={AppConstants.ICON.SIZE} color={Colors.white} />
            </Pressable>
          }
          <View style={{alignItems: "center", justifyContent: "center"}} >
            {
              loading ?
              <ActivityIndicator size={AppConstants.ICON.SIZE} color={Colors.white} /> :
              <Text style={Typography.regular}>{chapterName}</Text>
            }
          </View>
          {
            !isLastChapter &&
            <Pressable onPress={goToNextChapter} style={{marginTop: 2}}  hitSlop={AppConstants.HIT_SLOP.NORMAL}>
              <Ionicons name='chevron-forward' size={AppConstants.ICON.SIZE} color={Colors.white} />
            </Pressable>
          }
        </Row>
      </Row>
      <Pressable onPress={openBugReport} style={styles.button} >
        <Text style={styles.text}>
          If you encounter broken or missing images, please use the bug-report option.
        </Text>
        <Ionicons name='bug-outline' color={Colors.primary} size={AppConstants.ICON.SIZE}/>
      </Pressable>
      <Footer/>
    </Column>
  )
}

export default ChapterFooter

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL
  },
  button: {
    width: '100%',    
    paddingVertical: AppConstants.ITEM_PADDING_VERTICAL,
    paddingHorizontal: AppConstants.ITEM_PADDING_HORIZONTAL,
    gap: AppConstants.GAP * 2,
    alignItems: "center",    
    justifyContent: "center",
    borderRadius: AppConstants.BORDER_RADIUS, 
    backgroundColor: Colors.backgroundSecondary
  },
  text: {
    ...Typography.regular, 
    flexShrink: 1, 
    textAlign: "center"
  }
})