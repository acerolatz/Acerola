import React from 'react'
import { StyleSheet, View } from 'react-native'
import CustomActivityIndicator from './CustomActivityIndicator'

const PageActivityIndicator = () => {
  return (
    <View style={styles.container} >
      <CustomActivityIndicator/>
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