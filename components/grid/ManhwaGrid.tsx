import { getRelativeHeight, hp, wp } from '@/helpers/util'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { AppConstants } from '@/constants/AppConstants'
import { FlashList } from '@shopify/flash-list'
import { FlatList, StyleSheet, View } from 'react-native'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from '../ManhwaCard'
import Footer from '../util/Footer'
import React from 'react'


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
    showManhwaStatus?: boolean
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached,
    loading = false, 
    hasResults = true,
    numColumns = 2,
    shouldShowChapterDate = true,
    showsVerticalScrollIndicator = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    showManhwaStatus = true
}: MangaGridProps) => {

    const width = (wp(46) - AppConstants.GAP / 2)
    const height = hp(35)

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
                <View style={styles.footer} >
                    <CustomActivityIndicator/>
                </View>
            )
        }
        return <Footer/>
    }

    if (listMode == "FlashList") {
        return (
            <View style={styles.listContainer} >
                <FlashList
                    keyboardShouldPersistTaps={'handled'}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                    data={manhwas}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.manhwa_id.toString()}
                    estimatedItemSize={estimatedItemSize}
                    drawDistance={hp(100)}
                    onEndReached={onEndReached}
                    scrollEventThrottle={4}              
                    onEndReachedThreshold={1}
                    renderItem={renderItem}
                    ListFooterComponent={renderFooter}
                    />
            </View>
        )
    }
    
    return (
        <View style={styles.listContainer} >
            <FlatList
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                keyboardShouldPersistTaps={'handled'}
                data={manhwas}
                numColumns={numColumns}
                keyExtractor={(item) => item.manhwa_id.toString()}
                initialNumToRender={16}
                onEndReached={onEndReached}
                scrollEventThrottle={4}
                onEndReachedThreshold={1}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}/>
        </View>
    )    
}

export default ManhwaGrid

const styles = StyleSheet.create({
    listContainer: {
        flex: 1        
    },
    footer: {
        width: '100%', 
        marginBottom: 62, 
        marginTop: AppConstants.GAP, 
        alignItems: "center", 
        justifyContent: "center"
    }
})
