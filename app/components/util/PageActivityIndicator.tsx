import CustomActivityIndicator from './CustomActivityIndicator'
import { StyleSheet, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import React from 'react'


const PageActivityIndicator = ({color = Colors.primary}: {color?: string}) => {
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