import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ActivityIndicator } from 'react-native'
import React from 'react'


interface CustomActivityIndicatorProps {
  size?: number
  color?: string
}


const CustomActivityIndicator = ({
  size = AppConstants.UI.ICON.SIZE, 
  color = Colors.primary
}: CustomActivityIndicatorProps) => {
  return (
    <ActivityIndicator size={size} color={color} />
  )
}


export default CustomActivityIndicator