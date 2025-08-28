import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import ChapterImageItem from './ChapterImageItem'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { ChapterImage } from '@/helpers/types'
import ChapterFooter from './ChapterFooter'
import { View } from 'react-native'
import { hp } from '@/helpers/util'


const AUTO_SCROLL_SPEED = 2000 // pixels per second


interface ChapterReaderProps {
    images: ChapterImage[]
    estimatedItemSize: number
    manhwaTitle: string
    loading: boolean
    listHeader: React.ComponentType<any> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null | undefined
}


const DebugChapterReader = ({
    images,
    estimatedItemSize,
    manhwaTitle,
    loading,
    listHeader,
}: ChapterReaderProps) => {
    const flashListRef = useRef<FlashListRef<ChapterImage>>(null)
    const scrollOffset = useRef(0)
    const scrollInterval = useRef<number | null>(null)

    const scrollToTop = useCallback(() => {
        flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
        scrollOffset.current = 0
    }, [])

    const renderItem = useCallback(
        ({ item }: { item: ChapterImage }) => <ChapterImageItem item={item} />,
        []
    )

    const keyExtractor = useCallback((item: ChapterImage) => item.image_url, [])

    const listFooter = useMemo(
        () => (
            <ChapterFooter
                mangaTitle={manhwaTitle}
                loading={loading}
                scrollToTop={scrollToTop}
            />
        ),
        [manhwaTitle, loading, scrollToTop]
    )

    useEffect(() => {
        if (images.length === 0) return

        const intervalTime = 8 // 120fps
        const pixelsPerTick = (AUTO_SCROLL_SPEED / 1000) * intervalTime

        scrollInterval.current = setInterval(() => {
            scrollOffset.current += pixelsPerTick
            flashListRef.current?.scrollToOffset({
                offset: scrollOffset.current,
                animated: false,
            })
        }, intervalTime)

        return () => {
            if (scrollInterval.current !== null) {
                clearInterval(scrollInterval.current)
            }
        }
    }, [images])

    return (
        <View style={{ flex: 1 }}>
            <FlashList
                data={images}
                ref={flashListRef}
                drawDistance={hp(250)}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
            />
            <ChapterArrowUpButton onPress={scrollToTop} />
        </View>
    )
}

export default DebugChapterReader
