import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { spFetchChapterImagesUrls } from '@/lib/supabase'
import DownloadManager from '@/helpers/DownloadManager'
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
        const imgs: string[] = await spFetchChapterImagesUrls(chapter.chapter_id)
        await DownloadManager.addChapter(
            chapter.manhwa_id.toString(),
            manhwaTitle,
            chapter.chapter_id.toString(),
            chapter.chapter_num.toString(),
            imgs
        )
        Toast.show({text1: "Added to download queue", type: "info"})
        setLoading(false)
    }

    if (loading) {
        return <CustomActivityIndicator color={color} />
    }

    return <Button onPress={onPress} iconName='download-outline' iconColor={color} />
}

export default DownloadChapterButton

const styles = StyleSheet.create({})