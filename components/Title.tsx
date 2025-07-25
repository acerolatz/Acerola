import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'


interface TitleProps {
    title: string
    textColor?: string
}

const Title = ({title, textColor = Colors.white}: TitleProps) => {
  return (
    <View>
        <Text style={[AppStyle.textHeader, {fontSize: 22, fontFamily: 'LeagueSpartan_600SemiBold', color: textColor}]}>{title}</Text>
    </View>
  )
}

export default Title
