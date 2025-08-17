import { Pressable, StyleSheet, Text } from 'react-native'
import React from 'react'
import { getChapterGridNumColumns, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import { Typography } from '@/constants/typography'

const NUM_COLUMNS = getChapterGridNumColumns()
const ITEM_SIZE = Math.floor((wp(92) - AppConstants.MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS)


interface ChapterGridItemProps {
  isReaded: boolean
  chapterName: string
  index: number
  manhwaColor: string
  onPress: (index: number) => void
}


const ChapterGridItem = ({
  isReaded,    
  chapterName,
  index,
  manhwaColor,
  onPress  
}: ChapterGridItemProps) => {
  const backgroundColor = isReaded ? manhwaColor : Colors.backgroundSecondary
  const color = isReaded ? Colors.backgroundSecondary : Colors.white

  return (
    <Pressable
      onPress={() => onPress(index)}
      style={[styles.chapterItem, {backgroundColor}]} >
        <Text style={[Typography.regular, {color}]}>{chapterName}</Text>
    </Pressable>
  )
}


export default ChapterGridItem

const styles = StyleSheet.create({
    chapterItem: {    
        width: ITEM_SIZE, 
        height: ITEM_SIZE, 
        borderRadius: AppConstants.BORDER_RADIUS, 
        alignItems: "center", 
        justifyContent: "center"    
    }
})