import { Colors } from '@/constants/Colors'
import { ManhwaCard } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'


const MAX_WIDTH = wp(80)


interface RandomCardsGridProps {
    reloadCards: () => any
}

const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlashList<ManhwaCard>>(null)
    
    const onPress = (manhwa_id: number) => {
        router.navigate({pathname: '/ManhwaPage', params: {manhwa_id}})
    }

    const reload = async () => {
        await reloadCards()
        flatListRef.current?.scrollToIndex({index: 0, animated: true})
    }

    const renderItem = ({item}: {item: ManhwaCard}) => {

        const width = item.width > MAX_WIDTH ? MAX_WIDTH : item.width
        const height = (width * item.height) / item.width        

        return (
            <Pressable onPress={() => onPress(item.manhwa_id)} style={{marginRight: 10}} >
                <Image source={item.image_url} style={{width, height, borderRadius: 12}} contentFit='cover' />
                <View style={{maxWidth: '90%', position: 'absolute', top: 10, left: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.yellow, borderWidth: 2, borderColor: Colors.backgroundColor}} >
                    <Text numberOfLines={1} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.title}</Text>
                </View>
            </Pressable>
        )
    }

    if (cards.length === 0) {
        return <></>
    }
    
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Random'/>
                <RotatingButton onPress={reload} iconColor={Colors.white} />
            </Row>
            <FlashList
                ref={flatListRef}
                data={cards}
                estimatedItemSize={wp(90)}
                horizontal={true}
                keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                renderItem={renderItem}
            />
        </View>
    )
}

export default RandomCardsGrid

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 10,
        height: hp(100)
    }
})