import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import React, { useCallback } from 'react'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from '../ManhwaCard'
import Footer from '../util/Footer'
import { hp } from '@/helpers/util'
import { Typography } from '@/constants/typography'


interface MangaGridProps {
    manhwas: Manhwa[]
    onPress?: (manhwa: Manhwa) => any
    onEndReached?: () => void
    numColumns?: number
    showsVerticalScrollIndicator?: boolean
    showManhwaStatus?: boolean    
}


const ManhwaGrid = ({
    manhwas, 
    onPress,
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
            onPress={onPress}            
            width={AppConstants.MEDIA.MANHWA_COVER.WIDTH}
            height={AppConstants.MEDIA.MANHWA_COVER.HEIGHT}
            showManhwaStatus={showManhwaStatus}
            marginBottom={AppConstants.UI.MARGIN}
            manhwa={item}
        />
    ), [])

    if (manhwas.length == 0) {
        return (
            <Text style={Typography.regular} >You’ll find your downloads here.</Text>
        )
    }
    
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
    }    
})
