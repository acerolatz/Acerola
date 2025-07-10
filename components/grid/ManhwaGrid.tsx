import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { FlatList, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import CustomActivityIndicator from '../util/CustomActivityIndicator'


interface MangaGridProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    paddingHorizontal?: number
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    listMode?: 'FlashList' | 'FlatList'
    color?: string
    showManhwaStatus?: boolean
    listHeader?: React.ComponentType<any> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null | undefined
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached, 
    listHeader,
    loading = false, 
    hasResults = true,
    paddingHorizontal = wp(4),
    numColumns = 1,
    shouldShowChapterDate = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    color = Colors.yellow,
    showManhwaStatus = true
}: MangaGridProps) => {

    const {width, height} = getItemGridDimensions(
        paddingHorizontal,
        10,
        numColumns,
        AppConstants.COMMON.MANHWA_COVER_DIMENSION.WIDTH,
        AppConstants.COMMON.MANHWA_COVER_DIMENSION.HEIGHT
    )

    const estimatedItemSize = height + (showChaptersPreview ? 180 : 20)

    const renderItem = ({item}: {item: Manhwa}) => {
        return (
            <ManhwaCard 
                showChaptersPreview={showChaptersPreview} 
                shouldShowChapterDate={shouldShowChapterDate}
                showManhwaStatus={showManhwaStatus}
                width={width} 
                height={height} 
                marginBottom={6} 
                manhwa={item}
            />
        )
    }

    const renderFooter = () => {
        if (loading && hasResults) {
            return (
                <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                    <CustomActivityIndicator color={color}/>
                </View> 
            )
        }
        return <View style={{height: 60}} />
    }

    if (listMode == "FlashList") {
        return (
            <View style={{flex: 1}} >
                <FlashList
                    keyboardShouldPersistTaps={'always'}
                    data={manhwas}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.manhwa_id.toString()}
                    estimatedItemSize={estimatedItemSize}
                    drawDistance={hp(150)}
                    onEndReached={onEndReached}
                    scrollEventThrottle={4}
                    onEndReachedThreshold={2}
                    renderItem={renderItem}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={renderFooter}
                    />
            </View>
        )
    }
    
    return (
        <View style={{flex: 1}} >
            <FlatList
                keyboardShouldPersistTaps={'always'}
                data={manhwas}
                numColumns={numColumns}
                keyExtractor={(item) => item.manhwa_id.toString()}
                initialNumToRender={12}
                onEndReached={onEndReached}
                scrollEventThrottle={4}
                onEndReachedThreshold={3}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListFooterComponent={renderFooter}/>
        </View>
    )    
}

export default ManhwaGrid
