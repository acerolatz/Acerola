import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { FlatList, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import React, { useCallback } from 'react'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from '../ManhwaCard'
import Footer from '../util/Footer'


interface MangaGridProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    numColumns?: number
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
    showsVerticalScrollIndicator?: boolean
    showManhwaStatus?: boolean    
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached,
    loading = false, 
    hasResults = true,
    numColumns = 2,
    showChaptersPreview = true,
    shouldShowChapterDate = true,
    showsVerticalScrollIndicator = true,
    showManhwaStatus = true    
}: MangaGridProps) => {    

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

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Manhwa}) => (
        <ManhwaCard
            showChaptersPreview={showChaptersPreview} 
            shouldShowChapterDate={shouldShowChapterDate}
            showManhwaStatus={showManhwaStatus}
            width={AppConstants.MANHWA_COVER.WIDTH} 
            height={AppConstants.MANHWA_COVER.HEIGHT}
            marginBottom={AppConstants.GAP / 2}
            manhwa={item}
        />
      ), [])
    
    return (
        <View style={styles.container} >
            <FlatList
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                keyboardShouldPersistTaps={'handled'}
                data={manhwas}
                numColumns={numColumns}
                keyExtractor={keyExtractor}
                initialNumToRender={12}
                onEndReached={onEndReached}
                maxToRenderPerBatch={12}
                updateCellsBatchingPeriod={100}
                windowSize={5}
                onEndReachedThreshold={2}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}/>
        </View>
    )    
}

export default ManhwaGrid

const styles = StyleSheet.create({
    container: {
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
