import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


interface TopBarProps {
    title: string
    children?: React.JSX.Element
    titleColor?: string
    numberOfLines?: number
} 


const TopBar = ({title, children, numberOfLines, titleColor = Colors.yellow}: TopBarProps) => {
  return (
    <View style={styles.container} >
        <Text
          numberOfLines={numberOfLines}
          style={[AppStyle.textHeader, styles.title, {color: titleColor, alignSelf: "center"}]}>
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
    flexDirection: 'row',     
    marginTop: 4,
    marginBottom: 10, 
    alignItems: "center", 
    justifyContent: "space-between"
  },
  title: {
    alignSelf: "flex-start", 
    fontFamily: "LeagueSpartan_600SemiBold", 
    maxWidth: '80%',
  }
})