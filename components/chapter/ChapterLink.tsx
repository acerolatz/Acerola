import { Colors } from '@/constants/Colors'
import { FontSizes, Typography } from '@/constants/typography'
import { Chapter } from '@/helpers/types'
import { formatTimestamp } from '@/helpers/util'
import { spFetchChapterList } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native'


interface ChapterLinkProps {
    manhwa_id: number
    manhwa_title: string
    chapter_id: number
    chapter_name: string
    chapter_created_at: string
    index: number
    shouldShowChapterDate?: boolean
}

const ChapterLink = ({
    manhwa_id, 
    manhwa_title,
    index,
    chapter_id,
    chapter_created_at,
    chapter_name,
    shouldShowChapterDate = true
}: ChapterLinkProps) => {

    const { setChapterState } = useChapterState()
    const [loading, setLoading] = useState(false)
    
    const name = 'Chapter ' + chapter_name

    const onPress = useCallback(async () => {
        setLoading(true)
            const chapters: Chapter[] = await spFetchChapterList(manhwa_id)
            setChapterState(chapters, chapters.length - 1 - index)
        setLoading(false)        
        router.navigate({
            pathname: "/(pages)/ChapterPage",
            params: {manhwaTitle: manhwa_title}
        })
    }, [chapter_id])

    if (loading) {
        return (
            <View style={styles.chapterLink} >
                <ActivityIndicator size={FontSizes.xl} color={Colors.white} />
                {
                    shouldShowChapterDate &&
                    <Text style={Typography.regular}>{formatTimestamp(chapter_created_at)}</Text>
                }
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={styles.chapterLink} >
            <Text style={Typography.regular}>{name}</Text>
            {
                shouldShowChapterDate &&
                <Text style={Typography.regular}>{formatTimestamp(chapter_created_at)}</Text>
            }
        </Pressable>
    )
}

export default ChapterLink

const styles = StyleSheet.create({
    chapterLink: {        
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        height: FontSizes.xl,
        paddingRight: 6
    }    
})