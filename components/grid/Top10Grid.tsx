import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import BooleanRotatingButton from '../buttons/BooleanRotatingButton'
import { AppConstants } from '@/constants/AppConstants'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useRef, } from 'react'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import Row from '../util/Row'
import Title from '../Title'


const TOP_1O_ITEM_WIDTH = wp(30)
const TOP_1O_ITEM_HEIGHT = hp(24)


interface Top10ItemProps {
    title: string
    manhwa_id: number
    image_url: string
    index: number    
}

const Top10Item = ({
    title, 
    manhwa_id, 
    image_url, 
    index    
}: Top10ItemProps) => {

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa_id }
        });
    }, [manhwa_id]);

    return (
        <Pressable onPress={onPress} style={{marginRight: AppConstants.MARGIN}} >
            <View>
                <Image 
                    source={image_url} 
                    style={styles.image} 
                    contentFit='cover'
                    transition={AppConstants.DEFAULT_IMAGE_TRANSITION} />
                <LinearGradient colors={['transparent', 'transparent', Colors.backgroundColor]} style={styles.linearGradient} >
                    <Text style={styles.number} >{index + 1}</Text>
                    <Text numberOfLines={1} style={styles.manhwaTitle} >{title}</Text>
                </LinearGradient>
            </View>
        </Pressable>
    )
}


interface Top10GridProps {
    manhwas: Manhwa[]
    reloadTop10: () => any
}

const Top10Grid = ({manhwas, reloadTop10}: Top10GridProps) => {
        
    const flatListRef = useRef<FlatList>(null)

    const reload = async () => {
        await reloadTop10()
        flatListRef.current?.scrollToIndex({index: 0, animated: true})
    }    

    const keyExtractor = useCallback((item: Manhwa) => item.manhwa_id.toString(), [])

    const renderItem = useCallback(({item, index}: {item: Manhwa, index: number}) => (
        <Top10Item
            key={item.manhwa_id}
            title={item.title} 
            manhwa_id={item.manhwa_id} 
            image_url={item.cover_image_url} 
            index={index}
        />
    ), [])
    
    if (manhwas.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{justifyContent: "space-between"}} >
                <Title title="Today's Top 10"/>                
                <BooleanRotatingButton onPress={reload} iconName='reload-outline' />
            </Row>
            <FlatList
                ref={flatListRef}
                data={manhwas}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

export default Top10Grid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10
    },
    image: {
        width: TOP_1O_ITEM_WIDTH, 
        height: TOP_1O_ITEM_HEIGHT, 
        borderRadius: AppConstants.BORDER_RADIUS
    },
    linearGradient: {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
        justifyContent: 'flex-end'
    },
    number: {
        ...Typography.semiboldXl,
        color: Colors.primary,
        fontSize: hp(8),
        bottom: hp(2),
        left: wp(1)
    },    
    manhwaTitle: {
        ...Typography.regular, 
        maxWidth: TOP_1O_ITEM_WIDTH - 10,
        position: 'absolute',
        left: wp(1), 
        bottom: hp(1)
    }
})