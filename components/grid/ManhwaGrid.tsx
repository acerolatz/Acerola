import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { getItemGridDimensions, getRelativeHeight, hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { FlatList, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import Footer from '../util/Footer'


interface MangaGridProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    showsVerticalScrollIndicator?: boolean
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
    numColumns = 2,
    shouldShowChapterDate = true,
    showsVerticalScrollIndicator = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    color = Colors.primary,
    showManhwaStatus = true
}: MangaGridProps) => {

    const width = (wp(46) - AppConstants.GAP / 2)
    const height = getRelativeHeight(
        AppConstants.MANHWA_COVER.WIDTH,
        AppConstants.MANHWA_COVER.HEIGHT,
        width
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
                marginBottom={AppConstants.GAP / 2}
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
        return <Footer/>
    }

    if (listMode == "FlashList") {
        return (
            <View style={{flex: 1}} >
                <FlashList
                    keyboardShouldPersistTaps={'always'}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
