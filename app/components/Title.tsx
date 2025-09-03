import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import React from 'react'
import { Text } from 'react-native'


interface TitleProps {
  title: string
}

const Title = ({title}: TitleProps) => {
  return (    
    <Text style={{...Typography.semiboldLg, color: Colors.white}}>{title}</Text>
  )
}

export default Title
