import { Colors } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'


const CustomActivityIndicator = ({color = Colors.yellow}: {color?: string}) => {
  return (
    <ActivityIndicator size={32} color={color} />
  )
}


export default CustomActivityIndicator

const styles = StyleSheet.create({})