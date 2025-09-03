import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
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
    size = AppConstants.UI.ICON.SIZE,
    color = Colors.white
}: OpenBugReportButtonProps) => {

    const onPress = () => {
        router.navigate({
            pathname: "/(pages)/BugReportPage",
            params: title ? {title: title} : { }
        })
    }

    return (
        <Pressable 
            onPress={onPress}
            hitSlop={AppConstants.UI.HIT_SLOP.NORMAL} >
            <Ionicons name='bug-outline' color={color} size={size} />
        </Pressable>
    )
}

export default BugReportButton
