import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { useTop10State } from '@/store/top10State'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import Row from '../util/Row'


const Top10Item = ({manhwa, index}: {manhwa: Manhwa, index: number}) => {

    const onPress = useCallback(() => {
        router.push({
            pathname: '/(pages)/ManhwaPage',
            params: { manhwa_id: manhwa.manhwa_id }
        });
    }, [manhwa.manhwa_id]);

    return (
        <Pressable onPress={onPress} style={{marginRight: 6}} >
            <View>
                <Image source={manhwa.cover_image_url} style={{width: 160, height: 240, borderRadius: AppConstants.COMMON.BORDER_RADIUS}} contentFit='cover' />
                <LinearGradient colors={['transparent', Colors.backgroundColor]} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', justifyContent: 'flex-end'}} >                
                    <Text style={[AppStyle.textRegular, {left: 4, bottom: 4, color: Colors.yellow, top: 20, fontSize: 96, fontFamily: 'LeagueSpartan_600SemiBold'}]} >{index + 1}</Text>                
                </LinearGradient>
            </View>
            <Text numberOfLines={1} style={[AppStyle.textRegular, {maxWidth: 140}]} >{manhwa.title}</Text>
        </Pressable>
    )
}


const Top10Grid = () => {

    const { top10Manhwas } = useTop10State()

    if (top10Manhwas.length === 0) {
        return <></>
    }
    
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title="Today's Top 10"/>
            </Row>
            <View style={{width: '100%'}} >
                <FlatList
                    data={top10Manhwas}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                    renderItem={({item, index}) => <Top10Item manhwa={item} index={index} />}
                />
            </View>
        </View>
    )
}

export default Top10Grid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10
    }
})