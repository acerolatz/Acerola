import { Pressable, StyleSheet, Text } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface ChapterGridItemProps {
  isReaded: boolean
  chapterName: string
  index: number
  manhwaColor: string
  onPress: (index: number) => void
  itemSize: number
}


const ChapterGridItem = ({
  isReaded,    
  chapterName,
  index,
  manhwaColor,
  onPress,
  itemSize
}: ChapterGridItemProps) => {
  const backgroundColor = isReaded ? manhwaColor : Colors.backgroundSecondary
  const color = isReaded ? Colors.backgroundSecondary : Colors.white

  return (
    <Pressable
      onPress={() => onPress(index)}
      style={{
        ...styles.chapterItem, 
        width: itemSize, 
        height: itemSize, 
        backgroundColor
      }} >
        <Text style={{...Typography.light, color}}>{chapterName}</Text>
    </Pressable>
  )
}


export default ChapterGridItem


const styles = StyleSheet.create({
  chapterItem: {
    borderRadius: AppConstants.UI.BORDER_RADIUS, 
    alignItems: "center", 
    justifyContent: "center"    
  }
})