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
import { Colors } from '@/constants/Colors'


interface ChapterHeaderProps {
  mangaTitle: string
  currentChapter: Chapter
  isFirstChapter: boolean
  isLastChapter: boolean
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ 
  mangaTitle,
  currentChapter,
  isFirstChapter,
  isLastChapter,
  loading, 
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
      <TopBar title={mangaTitle} titleColor={'white'} numberOfLines={1} >
        <ReturnButton onPress={exitChapter} color={'white'}  backgroundColor={'transparent'} />
      </TopBar>
      <Row style={styles.row} >
        <BugReportButton size={32} title={reportTitle} backgroundColor={'transparent'} padding={0} />
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
    paddingHorizontal: wp(5), 
    paddingTop: 26, 
    paddingBottom: 8
  },
  row: {
    width: '100%', 
    justifyContent: "space-between",
    marginBottom: 20
  }
})