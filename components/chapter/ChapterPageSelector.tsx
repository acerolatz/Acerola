import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Row from '../util/Row'
import { AppStyle } from '@/styles/AppStyle'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import CButton from '../buttons/CButton'


interface ChapterPageSelectorProps {
  backgroundColor: string
  currentPage: number
  numChapters: number
  moveToPreviousChapterPage: () => any
  moveToNextChapterPage: () => any
}


const ChapterPageSelector = ({  
  backgroundColor,  
  currentPage,
  moveToPreviousChapterPage,
  moveToNextChapterPage,
  numChapters
}: ChapterPageSelectorProps) => {
  return (
    <Row style={{width: '100%', gap: AppConstants.MARGIN}} >
      <View style={{...AppStyle.button, backgroundColor, flex: 1}} >
          <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Chapters: {numChapters}</Text>
      </View>

      <Row style={{gap: AppConstants.MARGIN, flex: 1}} >
        <CButton 
          style={{...AppStyle.button, backgroundColor}}
          iconColor={Colors.backgroundColor}
          iconName="chevron-back-outline"
          onPress={moveToPreviousChapterPage}
        />
        <View style={{...styles.numberContainer, borderColor: backgroundColor}}>
          <Text style={{...Typography.regular, color: backgroundColor}}>{currentPage + 1}</Text>
        </View>
        <CButton 
          style={{...AppStyle.button, backgroundColor}}
          iconColor={Colors.backgroundColor}
          iconName="chevron-forward-outline"
          onPress={moveToNextChapterPage}
          />
      </Row>

    </Row>
  )
}

export default ChapterPageSelector

const styles = StyleSheet.create({
    numberContainer: {
        ...AppStyle.button,
        borderWidth: 1,    
        backgroundColor: 'transparent'
    }
})