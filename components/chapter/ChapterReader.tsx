import React, { useCallback, useMemo, useRef } from 'react'
import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import ChapterImageItem from './ChapterImageItem'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { ChapterImage } from '@/helpers/types'
import ChapterFooter from './ChapterFooter'
import { View } from 'react-native'
import { hp } from '@/helpers/util'


interface ChapterReaderProps {
    images: ChapterImage[]    
    manhwaTitle: string
    loading: boolean
    listHeader: React.ComponentType<any> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null | undefined
}


const ChapterReader = ({
    images,    
    manhwaTitle,
    loading,
    listHeader,
}: ChapterReaderProps) => {

    const flashListRef = useRef<FlashListRef<ChapterImage>>(null)

    const scrollToTop = useCallback(() => {
        flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }, [])

    const renderItem = useCallback(
        ({ item }: { item: ChapterImage }) => <ChapterImageItem item={item} />,
        []
    )

    const keyExtractor = useCallback((item: ChapterImage) => item.image_url, [])

    const listFooter = useMemo(
        () => (<ChapterFooter mangaTitle={manhwaTitle} loading={loading} scrollToTop={scrollToTop}/>),
        [manhwaTitle, loading, scrollToTop]
    )

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

export default ChapterReader
