import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import React, { useCallback, useMemo, useRef } from 'react'
import { useSettingsState } from '@/store/settingsState'
import ChapterImageItem from './ChapterImageItem'
import { ChapterImage } from '@/helpers/types'
import { FlatList, View } from 'react-native'
import ChapterFooter from './ChapterFooter'
import { Image } from 'expo-image'


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
    listHeader    
}: ChapterReaderProps) => {
        
    const { settings } = useSettingsState()
    const ticks = useRef(0)

    const flatListRef = useRef<FlatList>(null)

    const scrollToTop = useCallback(() => {
        flatListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }, [])

    const renderItem = useCallback(({item}: {item: ChapterImage}) => (
        <ChapterImageItem item={item} />
    ), [])

    const keyExtractor = useCallback((item: ChapterImage) => item.image_url, [])

    const listFooter = useMemo(() => (
        <ChapterFooter 
            mangaTitle={manhwaTitle}
            loading={loading}
            scrollToTop={scrollToTop}
        />
    ), [manhwaTitle, loading])        

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) { ticks.current += 1 }
        if (ticks.current >= 10) {
            ticks.current = 0
            console.log("clear")
            Image.clearDiskCache()
        }
    }, [images]);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 25,
        minimumViewTime: 100,
    }), []);

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged },
    ]);

    return (
        <View>
            <FlatList
                data={images}
                ref={flatListRef}
                windowSize={settings.windowSize}
                maxToRenderPerBatch={settings.maxToRenderPerBatch}
                updateCellsBatchingPeriod={settings.updateCellsBatchingPeriod}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                removeClippedSubviews={true}
            />
            <ChapterArrowUpButton onPress={scrollToTop} />
        </View>
    )
}

export default ChapterReader