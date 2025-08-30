import { StyleSheet, View, Text, ActivityIndicator } from 'react-native'
import BugReportButton from '../buttons/BugReportButton'
import { AppConstants } from '@/constants/AppConstants'
import RotatingButton from '../buttons/RotatingButton'
import { useChapterState } from '@/store/chapterState'
import { Typography } from '@/constants/typography'
import ReturnButton from '../buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import Column from '../util/Column'
import { Image } from 'expo-image'
import TopBar from '../TopBar'
import Row from '../util/Row'
import React from 'react'
import Button from '../buttons/Button'
import DownloadChapterButton from '../buttons/DownloadChapterButton'


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
  const chapter = chapters[currentChapterIndex]  
  const reportTitle = `${mangaTitle}/${chapter.chapter_name}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }
  
  const isFirstChapter = currentChapterIndex === 0
  const isLastChapter = currentChapterIndex >= chapters.length - 1

  const goToNextChapter = () => {
    if (loading) { return }
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const goToPreviousChapter = () => {
    if (loading) { return }
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)      
    }
  }


  return (
    <Column style={styles.container} >
      <TopBar title={mangaTitle} titleColor={'white'} >
        <ReturnButton onPress={exitChapter} color={'white'}/>
      </TopBar>

      <Row style={{justifyContent: "space-between"}} >
        
        <Row style={{gap: AppConstants.UI.ICON.SIZE}} >
          <BugReportButton title={reportTitle} />
          <RotatingButton onPress={reloadChapter} />
          <DownloadChapterButton chapter={chapter} manhwaTitle={mangaTitle} />
        </Row>

        <Row style={styles.chapterSelector} >
          <Text style={Typography.regular}>Chapter</Text>
          {
            !isFirstChapter &&
            <Button iconName='chevron-back' onPress={goToPreviousChapter} iconColor={Colors.white} />
          }
          <View style={styles.chapterNum} >
            {
              loading ?
              <ActivityIndicator size={AppConstants.UI.ICON.SIZE} color={Colors.white} /> :
              <Text style={Typography.regular}>{chapter.chapter_name}</Text>
            }
          </View>
          {
            !isLastChapter &&
            <Button iconName='chevron-forward' onPress={goToNextChapter} iconColor={Colors.white} />
          }
        </Row>

      </Row>
    </Column>
  )
}

export default ChapterHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: AppConstants.UI.GAP,
    paddingHorizontal: AppConstants.UI.SCREEN.PADDING_HORIZONTAL, 
    paddingTop: AppConstants.UI.SCREEN.PADDING_VERTICAL,
    marginBottom: AppConstants.UI.GAP * 2
  },
  chapterSelector: {
    gap: AppConstants.UI.GAP, 
    justifyContent: "flex-start"
  },
  chapterNum: {
    alignItems: "center", 
    justifyContent: "center"
  }
})