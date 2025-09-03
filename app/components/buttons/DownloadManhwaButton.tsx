import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { downloadManager } from '@/helpers/DownloadManager'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import { asyncPool } from '@/helpers/util'
import React, { useState } from 'react'
import Button from './Button'


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
        await asyncPool<Chapter, void>(
            8,
            chapters, 
            async (chapter: Chapter) => await downloadManager.addToQueue(db, {
                manhwa_name,
                manhwa_id,
                chapter_id: chapter.chapter_id,
                chapter_name: chapter.chapter_name
            }, 
            false)
        )
        Toast.show({text1: "Download started!", type: "info"})
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