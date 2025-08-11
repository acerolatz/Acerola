import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'


const TOP_1O_ITEM_WIDTH = 160
const TOP_1O_ITEM_HEIGHT = 240


const Top10Item = ({manhwa, index}: {manhwa: Manhwa, index: number}) => {

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);

    return (
        <Pressable onPress={onPress} style={{marginRight: AppConstants.COMMON.MARGIN}} >
            <View>
                <Image source={manhwa.cover_image_url} style={styles.image} contentFit='cover' />
                <LinearGradient colors={['transparent', Colors.backgroundColor]} style={styles.linearGradient} >
                    <Text style={[AppStyle.textRegular, styles.text]} >{index + 1}</Text>
                </LinearGradient>
                <Text numberOfLines={1} style={[AppStyle.textRegular, {maxWidth: TOP_1O_ITEM_WIDTH, position: 'absolute', left: 0, bottom: 0}]} >{manhwa.title}</Text>
            </View>
        </Pressable>
    )
}


const Top10Grid = ({manhwas}: {manhwas: Manhwa[]}) => {

    if (manhwas.length === 0) {
        return <></>
    }
    
    return (
        <View style={styles.container} >
            <Title title="Today's Top 10"/>
            <FlatList
                data={manhwas}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                renderItem={({item, index}) => <Top10Item manhwa={item} index={index} />}
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
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    },
    linearGradient: {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
        justifyContent: 'flex-end'
    },
    text: {
        left: 2, 
        bottom: 0, 
        color: Colors.yellow,
        fontSize: 96, 
        fontFamily: 'LeagueSpartan_600SemiBold'
    }
})