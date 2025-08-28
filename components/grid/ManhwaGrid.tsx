import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import React, { useCallback } from 'react'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from '../ManhwaCard'
import Footer from '../util/Footer'
import { hp } from '@/helpers/util'


interface MangaGridProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    numColumns?: number
    showsVerticalScrollIndicator?: boolean
    showManhwaStatus?: boolean    
}


const ManhwaGrid = ({
    manhwas, 
    onEndReached,
    numColumns = 2,    
    showsVerticalScrollIndicator = true,
    showManhwaStatus = true    
}: MangaGridProps) => {    

    const renderFooter = useCallback(() => {
        return <Footer/>
    }, [])

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

    const renderItem = useCallback(({item}: {item: Manhwa}) => (
        <ManhwaCard
            showManhwaStatus={showManhwaStatus}
            width={AppConstants.MEDIA.MANHWA_COVER.WIDTH} 
            height={AppConstants.MEDIA.MANHWA_COVER.HEIGHT}
            marginBottom={AppConstants.UI.GAP / 2}
            manhwa={item}
        />
      ), [])
    
    return (
        <View style={styles.container} >
            <FlashList
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                keyboardShouldPersistTaps={'handled'}
                numColumns={numColumns}
                data={manhwas}
                keyExtractor={keyExtractor}
                onEndReached={onEndReached}
                drawDistance={hp(250)}
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
        marginTop: AppConstants.UI.GAP, 
        alignItems: "center", 
        justifyContent: "center"
    }
})
