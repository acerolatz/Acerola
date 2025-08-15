import { Manhwa } from '@/helpers/types'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'
import Row from '../util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { hp, wp } from '@/helpers/util'


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
        <Pressable onPress={onPress} style={{marginRight: AppConstants.COMMON.MARGIN}} >
            <Image 
                style={styles.image} 
                source={image_url} 
                contentFit='cover' 
                transition={AppConstants.COMMON.IMAGE_TRANSITION} />
        </Pressable>
    )   
}



const ContinueReadingGrid = ({manhwas}: {manhwas: Manhwa[]}) => {

    const onViewAll = () => {
        router.navigate("/ReadingHistoryPage")
    } 

    if (manhwas.length === 0) {
        return <></>
    }
    
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
                keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                renderItem={({item}) => <Item manhwa_id={item.manhwa_id} image_url={item.cover_image_url} />}
            />
        </View>
    )
}

export default ContinueReadingGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.COMMON.GAP
    },
    image: {
        width: wp(20),
        height: hp(14),
        maxWidth: AppConstants.MANHWA_COVER.WIDTH,
        maxHeight: AppConstants.MANHWA_COVER.HEIGHT,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    }
})