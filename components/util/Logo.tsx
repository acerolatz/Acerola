import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '../../constants/AppConstants'
import { Typography } from '@/constants/typography'


const AppLogo = ({name = AppConstants.COMMON.APP_NAME}: {name?: string}) => {
  return (
    <Text style={styles.text}>{name}</Text>
  )
}


export default AppLogo


const styles = StyleSheet.create({
  text: {
    ...Typography.semiboldXl, 
    color: Colors.yellow, 
    textAlignVertical: 'center'
  }
})