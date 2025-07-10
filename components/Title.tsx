import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Text } from 'react-native'
import Row from './util/Row'


interface TitleProps {
    title: string
    iconName?: string
    textColor?: string
    iconColor?: string
}

const Title = ({title, iconName, textColor = Colors.white, iconColor = Colors.white}: TitleProps) => {
  return (
    <Row style={{gap: 10}} >
        <Text style={[AppStyle.textHeader, {fontSize: 24, fontFamily: 'LeagueSpartan_600SemiBold', color: textColor}]}>{title}</Text>
        {iconName && <Ionicons name={iconName as any} size={28} color={iconColor} />}
    </Row>
  )
}

export default Title
