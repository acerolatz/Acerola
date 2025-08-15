import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import React from 'react'
import { Text } from 'react-native'


interface TitleProps {
  title: string
  textColor?: string
}

const Title = ({title, textColor = Colors.white}: TitleProps) => {
  return (    
    <Text style={[Typography.semiboldLg, {color: textColor}]}>{title}</Text>
  )
}

export default Title
