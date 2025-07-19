import { Colors } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'


const CustomActivityIndicator = () => {
  return (
    <ActivityIndicator size={32} color={Colors.yellow} />
  )
}


export default CustomActivityIndicator

const styles = StyleSheet.create({})