import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import { formatTimestamp } from '@/helpers/util'
import { spFetchChapterList, spUpdateManhwaViews } from '@/lib/supabase'
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
    manhwaTitle: string
    chapter_id: number
    chapter_name: string
    chapter_created_at: string
    index: number
    shouldShowChapterDate?: boolean    
    prefix?: string    
    style?: StyleProp<ViewStyle>
}

const ChapterLink = ({
    manhwa_id, 
    manhwaTitle,
    index,
    chapter_id,
    chapter_created_at,
    chapter_name,
    shouldShowChapterDate = true,    
    prefix = 'Chapter ',
    style
}: ChapterLinkProps) => {

    const { setChapterState } = useChapterState()

    const [loading, setLoading] = useState(false)

    const onPress = useCallback(async () => {
        setLoading(true)
            const chapters: Chapter[] = await spFetchChapterList(manhwa_id)
            setChapterState(chapters, chapters.length - 1 - index)
            spUpdateManhwaViews(manhwa_id)
        setLoading(false)        
        router.navigate({
            pathname: "/(pages)/ChapterPage",
            params: {manhwaTitle}
        })
    }, [chapter_id])

    if (loading) {
        return (
            <View style={[styles.chapterLink, style]} >
                <ActivityIndicator size={20} color={Colors.white} />
            </View>    
        )
    }

    return (
        <Pressable onPress={onPress} style={[styles.chapterLink, style]} >
            <Text style={AppStyle.textRegular}>{prefix}{chapter_name}</Text>
            {
                shouldShowChapterDate &&
                <Text style={[AppStyle.textRegular, {paddingRight: 20}]}>
                    {formatTimestamp(chapter_created_at)}
                </Text>
            }
        </Pressable>
    )
}

export default ChapterLink

const styles = StyleSheet.create({
    chapterLink: {
        paddingVertical: 8,        
        borderRadius: 4,
        backgroundColor: Colors.backgroundColor,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20
    }
})