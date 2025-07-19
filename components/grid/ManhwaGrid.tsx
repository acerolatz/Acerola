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
    gap?: number
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    listMode?: 'FlashList' | 'FlatList'
    estimatedItemSize?: number
    activityIndicatorColor?: string
    showManhwaStatus?: boolean
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached, 
    loading = false, 
    hasResults = true,
    paddingHorizontal = wp(5), 
    gap = 10, 
    numColumns = 1,
    shouldShowChapterDate = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    estimatedItemSize = AppConstants.MANHWA_COVER_DIMENSION.height + 180,
    activityIndicatorColor = Colors.neonRed,
    showManhwaStatus = true
}: MangaGridProps) => {        

    const {width, height} = getItemGridDimensions(
        paddingHorizontal,
        gap,
        numColumns,
        AppConstants.MANHWA_COVER_DIMENSION.width,
        AppConstants.MANHWA_COVER_DIMENSION.height
    )

    const renderFooter = () => {
        if (loading && hasResults) {
            return (
                <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                    <CustomActivityIndicator/>
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
                    drawDistance={hp(100)}
                    onEndReached={onEndReached}
                    scrollEventThrottle={4}
                    onEndReachedThreshold={2}
                    renderItem={({item}) => 
                        <ManhwaCard 
                            showChaptersPreview={showChaptersPreview} 
                            shouldShowChapterDate={shouldShowChapterDate}
                            showManhwaStatus={showManhwaStatus}
                            width={width} 
                            height={height} 
                            marginBottom={6} 
                            manhwa={item} />
                    }
                    ListFooterComponent={renderFooter}
                    />
            </View>
        )
    }

    if (listMode == "FlatList") {
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
                    renderItem={({item}) => 
                        <ManhwaCard 
                            showChaptersPreview={showChaptersPreview} 
                            shouldShowChapterDate={shouldShowChapterDate} 
                            showManhwaStatus={showManhwaStatus}
                            width={width} 
                            height={height} 
                            marginBottom={6} 
                            manhwa={item} />
                    }
                    ListFooterComponent={renderFooter}/>
            </View>
        )
    }

    return <></>
}

export default ManhwaGrid
