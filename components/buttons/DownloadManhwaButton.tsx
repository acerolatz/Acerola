import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Button from './Button'
import { Chapter } from '@/helpers/types'
import { downloadManager } from '@/helpers/DownloadManager'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { Colors } from '@/constants/Colors'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'


interface  DownloadManhwaButtonProps {
    manhwa_name: string
    chapters: Chapter[]
    color?: string
}


const DownloadManhwaButton = ({manhwa_name, chapters, color = Colors.backgroundColor}: DownloadManhwaButtonProps) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        chapters.forEach(chapter => 
            downloadManager.addToQueue({chapter, manhwa_name}, false)
        )
        Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    }

    if (loading) {
        return <CustomActivityIndicator color={color} />
    }

    return (
        <Button onPress={onPress} iconName='download-outline' iconColor={color} />
    )
}


export default DownloadManhwaButton