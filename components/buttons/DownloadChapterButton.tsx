import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { spFetchChapterImagesUrls } from '@/lib/supabase'
import { downloadManager } from '@/helpers/DownloadManager'
import Toast from 'react-native-toast-message'
import { Chapter } from '@/helpers/types'
import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Button from './Button'
import { Colors } from '@/constants/Colors'


interface DownloadChapterButtonProps {
    manhwaTitle: string
    chapter: Chapter
    color?: string
}


const DownloadChapterButton = ({manhwaTitle, chapter, color = Colors.white}: DownloadChapterButtonProps) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
            const success: boolean = await downloadManager.addToQueue({ manhwa_name: manhwaTitle, chapter })
            if (success) {
                Toast.show({text1: "Added to download queue", type: "info"})
            } else {
                Toast.show({text1: "Could not add to download queue", type: "error"})   
            }
        setLoading(false)
    }

    if (loading) {
        return <CustomActivityIndicator color={color} />
    }

    return <Button onPress={onPress} iconName='download-outline' iconColor={color} />
}

export default DownloadChapterButton