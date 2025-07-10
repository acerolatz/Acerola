import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'


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
    <View style={{width: '100%', paddingHorizontal: wp(4)}} >
        
        {/* Chapter Controller Button */}
        <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20}} >
          <Text style={AppStyle.textHeader}>Chapter</Text>
          <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10}} >
            {
              !isFirstChapter &&
              <Pressable onPress={goToPreviousChapter} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} >
                <Ionicons name='chevron-back' size={24} color={Colors.white} />
              </Pressable>
            }
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={20} color={Colors.white} /> :
                <Text style={AppStyle.textHeader}>{currentChapter.chapter_name}</Text>
              }
            </View>
            {
              !isLastChapter &&
              <Pressable onPress={goToNextChapter} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL}>
                <Ionicons name='chevron-forward' size={24} color={Colors.white} />
              </Pressable>
            }
          </View>
        </View>
            
          
        {/* Custom Bug Report Button */}
        <Pressable onPress={openBugReport} style={{width: '100%', padding: 12, flexDirection: 'row', borderRadius: 4, backgroundColor: Colors.gray}} >
          <Text style={[AppStyle.textRegular, {fontSize: 18, flex: 0.8}]}>
            If you encounter broken or missing images, please use the bug-report option.
          </Text>
          <View style={{flex: 0.2, height: 64, alignSelf: "flex-start", alignItems: "center", justifyContent: "center"}} > 
            <Ionicons name='bug-outline' color={Colors.BugReportColor} size={48} />
          </View>
        </Pressable>

      </View>
  )
}

export default ChapterFooter

const styles = StyleSheet.create({})