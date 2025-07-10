import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'


interface OpenBugReportButtonProps {
    size?: number
    color?: string
    backgroundColor?: string
    title?: string
    padding?: number
}


const BugReportButton = ({
    title, 
    size = 28, 
    color = Colors.BugReportColor, 
    backgroundColor = Colors.backgroundColor,
    padding = 6
}: OpenBugReportButtonProps) => {

    const onPress = () => {
        router.navigate({
            pathname: "/(pages)/BugReportPage",
            params: title ? {title: title} : { }
        })
    }

    return (
        <Pressable onPress={onPress} style={[AppStyle.buttonBackground, {backgroundColor, padding}]} >
            <Ionicons name='bug-outline' color={color} size={size} />
        </Pressable>
    )
}

export default BugReportButton
