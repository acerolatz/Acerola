import { Colors } from '@/constants/Colors'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CustomActivityIndicator from './CustomActivityIndicator'


const PageActivityIndicator = ({color = Colors.yellow}: {color?: string}) => {
  return (
    <View style={styles.container} >
      <CustomActivityIndicator color={color} />
    </View>
  )
}

export default PageActivityIndicator

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
})