import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { downloadManager } from '@/helpers/DownloadManager'
import Toast from 'react-native-toast-message'
import React, { useState } from 'react'
import Button from './Button'
import { Colors } from '@/constants/Colors'
import { useSQLiteContext } from 'expo-sqlite'
import { DownloadRequest } from '@/helpers/types'


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
        const request: DownloadRequest = {
            manhwa_name,
            manhwa_id,
            chapter_id,
            chapter_name
        }
        await downloadManager.addToQueue(db, request, true, true)
        setLoading(false)
    }

    if (loading) {
        return <CustomActivityIndicator color={color} />
    }

    return <Button onPress={onPress} iconName='download-outline' iconColor={color} />
}

export default DownloadChapterButton