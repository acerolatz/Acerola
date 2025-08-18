import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { Pressable} from 'react-native'
import React from 'react'


interface ButtonProps {
    iconName: string
    onPress?: () => any
}


const Button = ({
  iconName, 
  onPress  
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress ? onPress : undefined} hitSlop={AppConstants.HIT_SLOP.NORMAL}  >
        <Ionicons name={iconName as any} size={AppConstants.ICON.SIZE} color={Colors.white} />
    </Pressable>
  )
}

export default Button
