import { Colors } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'

interface CustomActivityIndicatorProps {
  size?: number
  color?: string
}

const CustomActivityIndicator = ({size = 32, color = Colors.primary}: CustomActivityIndicatorProps) => {
  return (
    <ActivityIndicator size={size} color={color} />
  )
}


export default CustomActivityIndicator

const styles = StyleSheet.create({})