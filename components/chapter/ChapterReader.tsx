import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import React, { useCallback, useRef } from 'react'
import ChapterImageItem from './ChapterImageItem'
import { FlatList, View } from 'react-native'
import { ChapterImage } from '@/helpers/types'
import { useSettingsState } from '@/store/settingsState'


interface ChapterReaderProps {
    images: ChapterImage[]
    listHeader: React.ComponentType<any> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null | undefined
    listFooter: React.ComponentType<any> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null | undefined
}


const ChapterReader = ({
    images, 
    listHeader,
    listFooter
}: ChapterReaderProps) => {
        
    const flatListRef = useRef<FlatList>(null)
    const { settings } = useSettingsState()
    console.log(settings)

    const scrollToTop = useCallback(() => {
        flatListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }, [])

    const renderItem = useCallback(({item}: {item: ChapterImage}) => (
        <ChapterImageItem item={item} />
    ), []);

    const keyExtractor = useCallback((item: ChapterImage) => item.image_url, [])

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