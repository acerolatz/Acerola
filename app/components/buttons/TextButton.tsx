import { Pressable, Text } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyle'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'


interface TextButtonProps {
  text: string
  onPress?: () => any
  backgroundColor?: string
}


const TextButton = ({text, onPress, backgroundColor = Colors.primary}: TextButtonProps) => {

  return (
    <Pressable onPress={onPress} style={{...AppStyle.button, backgroundColor}} >
        <Text style={Typography.regularBlack}>{text}</Text>
    </Pressable>
  )
}

export default TextButton
