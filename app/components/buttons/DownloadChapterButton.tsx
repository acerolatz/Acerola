import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { downloadManager } from '@/helpers/DownloadManager'
import Toast from 'react-native-toast-message'
import React, { useState } from 'react'
import Button from './Button'
import { Colors } from '@/constants/Colors'
import { useSQLiteContext } from 'expo-sqlite'


interface DownloadChapterButtonProps {
    manhwa_id: number
    manhwa_name: string
    chapter_id: number
    chapter_name: string
    color?: string
}


const DownloadChapterButton = ({
    manhwa_id,
    manhwa_name,
    chapter_id, 
    chapter_name, 
    color = Colors.white
}: DownloadChapterButtonProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        const success: boolean = await downloadManager.addToQueue(
            db, {manhwa_name, manhwa_id, chapter_id, chapter_name }
        )
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