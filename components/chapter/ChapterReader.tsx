import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import React, { useCallback, useMemo, useRef } from 'react'
import ChapterImageItem from './ChapterImageItem'
import { FlatList, View } from 'react-native'
import { ChapterImage } from '@/helpers/types'
import { useSettingsState } from '@/store/settingsState'
import ChapterFooter from './ChapterFooter'


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
        
    const flatListRef = useRef<FlatList>(null)
    const { settings } = useSettingsState()

    const scrollToTop = useCallback(() => {
        flatListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }, [])

    const renderItem = useCallback(({item}: {item: ChapterImage}) => (
        <ChapterImageItem item={item} />
    ), []);

    const keyExtractor = useCallback((item: ChapterImage) => item.image_url, [])

    const listFooter = useMemo(() => (
        <ChapterFooter 
            mangaTitle={manhwaTitle}
            loading={loading}
            scrollToTop={scrollToTop}
        />
    ), [manhwaTitle, loading])

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
            />
            <ChapterArrowUpButton onPress={scrollToTop} />
        </View>
    )
}

export default ChapterReader