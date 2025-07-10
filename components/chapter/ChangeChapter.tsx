import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'


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
    <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Chapter</Text>
      {
        !isFirstChapter &&
        <Pressable onPress={goToPreviousChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
          <Ionicons name='chevron-back' size={20} color={Colors.white} />
        </Pressable>
      }
      <View style={{alignItems: "center", justifyContent: "center"}} >
        {
          loading ?
          <ActivityIndicator size={20} color={Colors.white} /> :
          <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentChapter.chapter_name}</Text>
        }
      </View>
      {
        !isLastChapter &&
        <Pressable onPress={goToNextChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}}  hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
          <Ionicons name='chevron-forward' size={20} color={Colors.white} />
        </Pressable>
      }
    </View> 
  )
}

export default ChangeChapter
