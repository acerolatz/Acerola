import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Row from '../util/Row'
import Column from '../util/Column'
import { Typography } from '@/constants/typography'


interface ChapterFooterProps {
  mangaTitle: string
  currentChapter: Chapter
  isFirstChapter: boolean
  isLastChapter: boolean
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterFooter = ({
  mangaTitle, 
  currentChapter,
  isFirstChapter,
  isLastChapter,
  loading, 
  goToPreviousChapter, 
  goToNextChapter 
}: ChapterFooterProps) => {  

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReportPage",
      params: {title: `${mangaTitle!}/${currentChapter.chapter_name}`}
    })
  }

  return (
    <Column style={styles.container} >
        {/* Chapter Controller Button */}
        <Row style={styles.chapterSelector} >
          <Text style={Typography.regular}>Chapter</Text>
          <Row style={{gap: AppConstants.COMMON.GAP}} >
            {
              !isFirstChapter &&
              <Pressable onPress={goToPreviousChapter} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                <Ionicons name='chevron-back' size={AppConstants.ICON.SIZE} color={Colors.white} />
              </Pressable>
            }
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={AppConstants.ICON.SIZE} color={Colors.white} /> :
                <Text style={Typography.regular}>{currentChapter.chapter_name}</Text>
              }
            </View>
            {
              !isLastChapter &&
              <Pressable onPress={goToNextChapter} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE}>
                <Ionicons name='chevron-forward' size={AppConstants.ICON.SIZE} color={Colors.white} />
              </Pressable>
            }
          </Row>
        </Row>
            
          
        {/* Custom Bug Report Button */}
        <Pressable onPress={openBugReport} style={styles.button} >
          <Text style={{...Typography.regular, flexShrink: 1, textAlign: "center"}}>
            If you encounter broken or missing images, please use the bug-report option.
          </Text>
          <Ionicons name='bug-outline' color={Colors.yellow} size={32}/>
        </Pressable>

      </Column>
  )
}

export default ChapterFooter

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    paddingHorizontal: AppConstants.COMMON.SCREEN_PADDING_HORIZONTAL,
    gap: AppConstants.COMMON.GAP * 2
  },
  chapterSelector: {
    gap: AppConstants.COMMON.GAP
  },  
  button: {
    width: '100%',    
    paddingVertical: AppConstants.COMMON.ITEM_PADDING_VERTICAL,
    paddingHorizontal: AppConstants.COMMON.ITEM_PADDING_HORIZONTAL,
    gap: AppConstants.COMMON.GAP * 2,
    alignItems: "center",    
    justifyContent: "center",
    borderRadius: AppConstants.COMMON.BORDER_RADIUS, 
    backgroundColor: Colors.backgroundSecondary
  }
})