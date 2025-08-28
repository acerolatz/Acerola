import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { useChapterState } from '@/store/chapterState'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import Footer from '../util/Footer'
import Column from '../util/Column'
import Row from '../util/Row'
import React from 'react'


interface ChapterFooterProps {
  mangaTitle: string  
  loading: boolean
  scrollToTop: () => any
}


const ChapterFooter = ({
  mangaTitle,  
  loading,
  scrollToTop
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
    if (loading) { return }
    if (currentChapterIndex + 1 < chapters.length) {
      scrollToTop()
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const goToPreviousChapter = () => {
    if (loading) { return }
    if (currentChapterIndex - 1 >= 0) {
      scrollToTop()
      setCurrentChapterIndex(currentChapterIndex - 1)      
    }
  }

  return (
    <Column style={styles.container} >
      {
        !loading &&
        <Row style={{gap: AppConstants.UI.GAP}} >
          <Text style={Typography.regular}>Chapter</Text>
          {
            !isFirstChapter &&
            <Pressable onPress={goToPreviousChapter} style={{marginTop: 2}} hitSlop={AppConstants.UI.HIT_SLOP.NORMAL} >
              <Ionicons name='chevron-back' size={AppConstants.UI.ICON.SIZE} color={Colors.white} />
            </Pressable>
          }
          <View style={{alignItems: "center", justifyContent: "center"}} >
            <Text style={Typography.regular}>{chapterName}</Text>
          </View>
          {
            !isLastChapter &&
            <Pressable onPress={goToNextChapter} style={{marginTop: 2}}  hitSlop={AppConstants.UI.HIT_SLOP.NORMAL}>
              <Ionicons name='chevron-forward' size={AppConstants.UI.ICON.SIZE} color={Colors.white} />
            </Pressable>
          }
        </Row>
      }
      <Pressable onPress={openBugReport} style={styles.button} >
        <Text style={styles.text}>
          If you encounter broken or missing images, please use the bug-report option.
        </Text>
        <Ionicons name='bug-outline' color={Colors.white} size={AppConstants.UI.ICON.SIZE}/>
      </Pressable>
      <Footer height={120} />
    </Column>
  )
}

export default ChapterFooter

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    marginTop: AppConstants.UI.GAP * 2,
    gap: AppConstants.UI.GAP * 2,
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL
  },
  button: {
    width: '100%',    
    paddingHorizontal: AppConstants.UI.ITEM_PADDING.HORIZONTAL,
    paddingVertical: AppConstants.UI.ITEM_PADDING.VERTICAL,
    gap: AppConstants.UI.GAP * 2,
    alignItems: "center",    
    justifyContent: "center",
    borderRadius: AppConstants.UI.BORDER_RADIUS, 
    backgroundColor: Colors.backgroundSecondary
  },
  text: {
    ...Typography.regular,
    flexShrink: 1, 
    textAlign: "center"
  }
})