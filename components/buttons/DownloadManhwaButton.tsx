import React, { useState } from 'react'
import Button from './Button'
import { Chapter } from '@/helpers/types'
import { downloadManager } from '@/helpers/DownloadManager'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { Colors } from '@/constants/Colors'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import { useSQLiteContext } from 'expo-sqlite'
import { sleep } from '@/helpers/util'


interface  DownloadManhwaButtonProps {
    manhwa_name: string
    manhwa_id: number
    chapters: Chapter[]
    color?: string
}


const DownloadManhwaButton = ({
    manhwa_name,
    manhwa_id, 
    chapters, 
    color = Colors.backgroundColor
}: DownloadManhwaButtonProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
        chapters.forEach(chapter => 
            downloadManager.addToQueue(db, {manhwa_name, manhwa_id, chapter_id: chapter.chapter_id, chapter_name: chapter.chapter_name}, false)
        )
        Toast.show({text1: "Download started!", type: "info"})
        await sleep(2)
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