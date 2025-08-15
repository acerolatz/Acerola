import { Chapter } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import TopBar from '../TopBar'
import BugReportButton from '../buttons/BugReportButton'
import ReturnButton from '../buttons/ReturnButton'
import Row from '../util/Row'
import ChangeChapter from './ChangeChapter'
import Ionicons from '@expo/vector-icons/Ionicons'
import RotatingButton from '../buttons/RotatingButton'
import { AppConstants } from '@/constants/AppConstants'


interface ChapterHeaderProps {
  mangaTitle: string
  currentChapter: Chapter
  isFirstChapter: boolean
  isLastChapter: boolean
  loading: boolean
  reloadChapter: () => any
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ 
  mangaTitle,
  currentChapter,
  isFirstChapter,
  isLastChapter,
  loading, 
  reloadChapter,
  goToPreviousChapter, 
  goToNextChapter
}: ChapterHeaderProps) => {

  const reportTitle = `${mangaTitle}/${currentChapter.chapter_name}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
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
        <ChangeChapter
            isFirstChapter={isFirstChapter}
            currentChapter={currentChapter}
            isLastChapter={isLastChapter}
            goToNextChapter={goToNextChapter}
            goToPreviousChapter={goToPreviousChapter}
            loading={loading}            
            />
      </Row>
    </View>
  )
}

export default ChapterHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: AppConstants.COMMON.GAP,
    paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL, 
    paddingTop: AppConstants.COMMON.SCREEN_PADDING_VERTICAL
  }  
})