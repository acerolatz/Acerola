import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { Pressable} from 'react-native'
import React from 'react'


interface ButtonProps {
  iconName: string
  onPress?: () => any
  iconColor?: string
}


const Button = ({
  iconName, 
  onPress,
  iconColor = Colors.white
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress ? onPress : undefined} hitSlop={AppConstants.UI.HIT_SLOP.NORMAL}  >
        <Ionicons name={iconName as any} size={AppConstants.UI.ICON.SIZE} color={iconColor} />
    </Pressable>
  )
}

export default Button
