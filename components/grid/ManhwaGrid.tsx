import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'


interface MangaGridProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    shouldScrollToTopWhenManhwasChange?: boolean
    paddingHorizontal?: number
    gap?: number
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    listMode?: 'FlashList' | 'FlatList'
    estimatedItemSize?: number
    activityIndicatorColor?: string
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached, 
    loading = false, 
    hasResults = true,
    shouldScrollToTopWhenManhwasChange = false,
    paddingHorizontal = wp(5), 
    gap = 10, 
    numColumns = 1,
    shouldShowChapterDate = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    estimatedItemSize = AppConstants.MangaCoverDimension.height + 180,
    activityIndicatorColor = Colors.ononokiBlue
}: MangaGridProps) => {    

    const ref = useRef<FlashList<Manhwa>>(null)

    const {width, height} = getItemGridDimensions(
        paddingHorizontal,
        gap,
        numColumns,
        AppConstants.MangaCoverDimension.width,
        AppConstants.MangaCoverDimension.height
    )

    useEffect(
        () => {            
            if (shouldScrollToTopWhenManhwasChange) {
                ref.current?.scrollToOffset({animated: false, offset: 0})
            }
        },
        [manhwas, shouldScrollToTopWhenManhwasChange]
    )

    const renderFooter = () => {
        if (loading && hasResults) {
            return (
                <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                    <ActivityIndicator size={32} color={activityIndicatorColor} />
                </View> 
            )
        }
        return <View style={{height: 60}} />
    }

    if (listMode == "FlashList") {
        return (
            <View style={{flex: 1}} >
                <FlashList
                    ref={ref as any}
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
                    ref={ref as any}
                    data={manhwas}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.manhwa_id.toString()}
                    initialNumToRender={4}
                    onEndReached={onEndReached}
                    scrollEventThrottle={4}
                    onEndReachedThreshold={3}
                    renderItem={({item}) => 
                        <ManhwaCard 
                            showChaptersPreview={showChaptersPreview} 
                            shouldShowChapterDate={shouldShowChapterDate} 
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
