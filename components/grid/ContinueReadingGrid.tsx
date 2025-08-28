import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import ViewAllButton from '../buttons/ViewAllButton'
import React, { useCallback } from 'react'
import { Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import Title from '../Title'
import Row from '../util/Row'


interface ItemProps {
    manhwa_id: number
    image_url: string
}


const Item = ({manhwa_id, image_url} : ItemProps) => {

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa_id }
        });
    }, [manhwa_id]);

    return (
        <Pressable onPress={onPress} style={{marginRight: AppConstants.UI.MARGIN}} >
            <Image 
                style={styles.image} 
                source={image_url} 
                contentFit='cover' 
                transition={AppConstants.UI.ANIMATION_TIME} />
        </Pressable>
    )   
}


const ContinueReadingGrid = ({manhwas}: {manhwas: Manhwa[]}) => {
    
    const onViewAll = useCallback(() => {
        router.navigate("/ReadingHistoryPage")
    }, [])

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])
    
    const renderItem = useCallback(({item}: {item: Manhwa}) => (
        <Item manhwa_id={item.manhwa_id} image_url={item.cover_image_url} />
    ), [])

    if (manhwas.length === 0) { return <></> }
    
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Jump Back In'/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <FlatList
                data={manhwas}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
            />
        </View>
    )
}

export default ContinueReadingGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.UI.GAP
    },
    image: {
        width: wp(18),
        height: hp(14),
        borderRadius: AppConstants.UI.BORDER_RADIUS
    }
})