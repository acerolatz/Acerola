import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


interface TopBarProps {
  title: string  
  titleColor?: string
  children?: React.JSX.Element
} 


const TopBar = ({title, children, titleColor = Colors.primary}: TopBarProps) => {
  return (
    <View style={styles.container} >
        <Text
          numberOfLines={1}
          style={[styles.title, {color: titleColor}]}>
          {title}
        </Text>
        {children}
    </View>
  )
}

export default TopBar


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: "center", 
    justifyContent: "space-between"
  },
  title: {
    ...Typography.semiboldXl,
    maxWidth: '80%',
  }
})