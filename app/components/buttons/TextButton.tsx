import { Pressable, StyleSheet, Text } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyle'
import { Typography } from '@/constants/typography'


interface TextButtonProps {
    text: string
    onPress?: () => any
}


const TextButton = ({text, onPress}: TextButtonProps) => {
  return (
    <Pressable onPress={onPress} style={AppStyle.button} >
        <Text style={Typography.regularBlack}>{text}</Text>
    </Pressable>
  )
}

export default TextButton
