import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'


interface ManhwaStatusComponentProps {
    status: string
    fontSize?: number
    paddingVertical?: number
    paddingHorizontal?: number    
    borderRadius?: number
    backgroundColor?: string
    style?: StyleProp<ViewStyle>
}


const ManhwaStatusComponent = ({
    status,
    style,
    backgroundColor = Colors.clayDust,
    fontSize = 16,
    paddingVertical = 12,
    paddingHorizontal = 10,
    borderRadius = 0
}: ManhwaStatusComponentProps) => {
    return (
        <View style={[{
            paddingHorizontal, 
            paddingVertical,
            borderRadius,
            backgroundColor,
            alignSelf: 'flex-start'
        }, style]} >
            <Text style={[AppStyle.textRegular, {color: Colors.manhwaStatusTextColor}, {fontSize}]}>{status}</Text>
        </View>
    )
}

export default ManhwaStatusComponent