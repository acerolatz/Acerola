import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import Row from '../util/Row'
import React from 'react'


interface ChangeChapterProps {
  loading: boolean
  isFirstChapter: boolean
  isLastChapter: boolean
  currentChapter: Chapter
  goToPreviousChapter: () => any
  goToNextChapter: () => any
}

const ChangeChapter = ({
  loading,
  isFirstChapter,
  isLastChapter,
  currentChapter,
  goToPreviousChapter,
  goToNextChapter
}: ChangeChapterProps) => {

  return (
    <Row style={{gap: 10, justifyContent: "flex-start"}} >
      <Text style={Typography.regular}>Chapter</Text>
      {
        !isFirstChapter &&
        <Pressable onPress={goToPreviousChapter} style={{marginTop: 2}} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
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
        <Pressable onPress={goToNextChapter} style={{marginTop: 2}}  hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
          <Ionicons name='chevron-forward' size={AppConstants.ICON.SIZE} color={Colors.white} />
        </Pressable>
      }
    </Row> 
  )
}

export default ChangeChapter