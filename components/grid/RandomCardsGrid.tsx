import { Colors } from '@/constants/Colors'
import { ManhwaCard } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spUpdateManhwaCardView } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { debounce } from 'lodash'
import React, { useRef } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'


const MAX_WIDTH = wp(87)
const MAX_HEIGHT = hp(80)


interface RandomCardsGridProps {
    reloadCards: () => any
}

const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlatList<ManhwaCard>>(null)    
    
    const onPress = async (manhwa_id: number) => {
        spUpdateManhwaCardView(manhwa_id)
        router.navigate({pathname: '/ManhwaPage', params: {manhwa_id}})
    }

    const reload = async () => {
        await reloadCards()
        flatListRef.current?.scrollToIndex({index: 0, animated: true})
    }

    const debounceReload = debounce(reload, 800)

    const renderItem = ({item, index}: {item: ManhwaCard, index: number}) => {

        const height = item.height > MAX_HEIGHT ? MAX_HEIGHT : item.height
        let width = (height * item.width) / item.height
        width = width > MAX_WIDTH ? MAX_WIDTH : width

        return (
            <Pressable onPress={() => onPress(item.manhwa_id)} style={{marginRight: 4}} >
                <Image source={item.image_url} style={{width, height, borderRadius: 12}} contentFit='cover' />
                <View style={{maxWidth: '90%', position: 'absolute', top: 6, left: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.yellow, borderWidth: 1, borderColor: Colors.backgroundColor}} >
                    <Text numberOfLines={1} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.title}</Text>
                </View>
            </Pressable>
        )
    }

    if (cards.length === 0) {
        return (
            <View style={styles.container} >
                <Row style={{width: '100%', justifyContent: "space-between"}} >
                    <Title title='Random'/>
                    <RotatingButton onPress={debounceReload} />
                </Row>
            </View>
        )
    }
    
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Random'/>
                <RotatingButton onPress={debounceReload} />
            </Row>
            <View style={{width: '100%', height: MAX_HEIGHT}} >
                <FlatList
                    ref={flatListRef}
                    data={cards}
                    initialNumToRender={4}
                    onEndReachedThreshold={3}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                    renderItem={renderItem}
                />
            </View>
        </View>
    )
}

export default RandomCardsGrid

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 10
    }
})