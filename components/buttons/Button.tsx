import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, View, ViewStyle } from 'react-native'


interface ButtonProps {
    iconName: string
    onPress: () => any
    iconSize?: number
    iconColor?: string
    style?: ViewStyle
    showLoading?: boolean
}


const Button = ({
  iconName, 
  onPress, 
  style, 
  iconSize = 28, 
  iconColor = Colors.white,
  showLoading = true
}: ButtonProps) => {

  const [loading, setLoading] = useState(false)

  const p = async () => {
    setLoading(true)
    await onPress()
    setLoading(false)
  }
  
  if (loading) {
    <View style={style} >
        { 
          showLoading ? 
          <ActivityIndicator size={iconSize} color={iconColor} /> :
          <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
        }
    </View>
  }

  return (
    <Pressable onPress={p} hitSlop={AppConstants.COMMON.HIT_SLOP.NORMAL} style={style} >
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </Pressable>
  )

}

export default Button
