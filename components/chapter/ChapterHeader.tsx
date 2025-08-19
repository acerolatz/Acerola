import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native'
import BugReportButton from '../buttons/BugReportButton'
import { AppConstants } from '@/constants/AppConstants'
import RotatingButton from '../buttons/RotatingButton'
import { useChapterState } from '@/store/chapterState'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import ReturnButton from '../buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import TopBar from '../TopBar'
import Row from '../util/Row'
import React from 'react'


interface ChapterHeaderProps {
  mangaTitle: string
  loading: boolean
  reloadChapter: () => any  
}


const ChapterHeader = ({ 
  mangaTitle,
  loading, 
  reloadChapter  
}: ChapterHeaderProps) => {

  const { chapters, currentChapterIndex, setCurrentChapterIndex } =  useChapterState()  
  const chapterName = currentChapterIndex < chapters.length ? chapters[currentChapterIndex].chapter_name : ''
  const reportTitle = `${mangaTitle}/${chapterName}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }  
  
  const isFirstChapter = currentChapterIndex === 0
  const isLastChapter = currentChapterIndex >= chapters.length - 1

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
    <View style={styles.container} >
      <TopBar title={mangaTitle} titleColor={'white'} >
        <ReturnButton onPress={exitChapter} color={'white'}/>
      </TopBar>
      <Row style={{justifyContent: "space-between"}} >
        <Row style={{gap: AppConstants.ICON.SIZE}} >
          <BugReportButton title={reportTitle} />
          <RotatingButton onPress={reloadChapter} />
        </Row>
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
    </View>
  )
}

export default ChapterHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: AppConstants.GAP,
    height: AppConstants.PAGES.CHAPTER.HEADER_HEIGHT,
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL, 
    paddingTop: AppConstants.SCREEN.PADDING_VERTICAL
  }  
})