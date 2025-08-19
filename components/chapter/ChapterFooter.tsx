import { Pressable, StyleSheet, Text } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import Column from '../util/Column'
import { router } from 'expo-router'
import React from 'react'


interface ChapterFooterProps {
  mangaTitle: string
  chapterName: string
}


const ChapterFooter = ({
  mangaTitle, 
  chapterName
}: ChapterFooterProps) => {  

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReportPage",
      params: {title: `${mangaTitle!}/${chapterName}`}
    })
  }

  return (
    <Column style={styles.container} >
        <Pressable onPress={openBugReport} style={styles.button} >
          <Text style={styles.text}>
            If you encounter broken or missing images, please use the bug-report option.
          </Text>
          <Ionicons name='bug-outline' color={Colors.primary} size={AppConstants.ICON.SIZE}/>
        </Pressable>
      </Column>
  )
}

export default ChapterFooter

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL,
    height: AppConstants.PAGES.CHAPTER.FOOTER_HEIGHT
  },
  button: {
    width: '100%',    
    paddingVertical: AppConstants.ITEM_PADDING_VERTICAL,
    paddingHorizontal: AppConstants.ITEM_PADDING_HORIZONTAL,
    gap: AppConstants.GAP * 2,
    alignItems: "center",    
    justifyContent: "center",
    borderRadius: AppConstants.BORDER_RADIUS, 
    backgroundColor: Colors.backgroundSecondary
  },
  text: {
    ...Typography.regular, 
    flexShrink: 1, 
    textAlign: "center"
  }
})