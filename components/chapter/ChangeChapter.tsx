import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { useChapterState } from '@/store/chapterState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'


interface ChangeChapterProps {
  loading: boolean
  goToPreviousChapter: () => any,
  goToNextChapter: () => any
}

const ChangeChapter = ({
  loading,
  goToPreviousChapter,
  goToNextChapter
}: ChangeChapterProps) => {

  const { currentChapterIndex, chapters } = useChapterState()
  
  const currentChapter = chapters[currentChapterIndex]

  return (
    <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Chapter</Text>
      <Pressable onPress={goToPreviousChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop} >
        <Ionicons name='chevron-back' size={20} color={Colors.white} />
      </Pressable>
      <View style={{alignItems: "center", justifyContent: "center"}} >
        {
          loading ?
          <ActivityIndicator size={20} color={Colors.white} /> :
          <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentChapter.chapter_name}</Text>
        }
      </View>
      <Pressable onPress={goToNextChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}}  hitSlop={AppConstants.hitSlop}>
        <Ionicons name='chevron-forward' size={20} color={Colors.white} />
      </Pressable>
    </View> 
  )
}

export default ChangeChapter

const styles = StyleSheet.create({})