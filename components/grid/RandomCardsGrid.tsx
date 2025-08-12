import { Colors } from '@/constants/Colors'
import { Manhwa, ManhwaCard } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spFetchManhwaById, spUpdateManhwaCardView } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { debounce } from 'lodash'
import React, { useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'
import { useSQLiteContext } from 'expo-sqlite'
import { dbHasManhwa, dbUpsertManhwa } from '@/lib/database'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import { AppConstants } from '@/constants/AppConstants'
import CustomActivityIndicator from '../util/CustomActivityIndicator'


const MAX_WIDTH = wp(87)
const MAX_HEIGHT = hp(80)


interface RandomCardsGridProps {
    reloadCards: () => any
}

const ManhwaRandomCard = ({card}: {card: ManhwaCard}) => {

    const db = useSQLiteContext()
    const height = card.height > MAX_HEIGHT ? MAX_HEIGHT : card.height
    let width = (height * card.width) / card.height
    width = width > MAX_WIDTH ? MAX_WIDTH : width

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        const hasManhwa = await dbHasManhwa(db, card.manhwa_id)
        if (!hasManhwa) {
            setLoading(true)
                const m: Manhwa | null = await spFetchManhwaById(card.manhwa_id)
                if (!m) {
                    Toast.show(ToastMessages.EN.INVALID_MANHWA)
                    return
                }
                await dbUpsertManhwa(db, m)
            setLoading(false)
        }
        spUpdateManhwaCardView(card.manhwa_id)
        router.navigate({
            pathname: '/ManhwaPage', 
            params: {
                manhwa_id: card.manhwa_id
        }})
    }

    if (loading) {
        return (
            <View style={{width, height, marginRight: AppConstants.COMMON.MARGIN, alignItems: 'center', justifyContent: "center"}} >
                <CustomActivityIndicator/>
            </View>
        )
    }

    return (
        <Pressable onPress={() => onPress()} style={{marginRight: AppConstants.COMMON.MARGIN}} >
            <Image source={card.image_url} style={{width, height, borderRadius: 12}} contentFit='cover' />
            <View style={{maxWidth: '90%', position: 'absolute', top: 6, left: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.yellow, borderWidth: 1, borderColor: Colors.backgroundColor}} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{card.title}</Text>
            </View>
        </Pressable>
    )
}

const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlatList<ManhwaCard>>(null)    
    
    const reload = async () => {
        await reloadCards()
        flatListRef.current?.scrollToIndex({index: 0, animated: true})
    }

    const debounceReload = debounce(reload, 800)

    const renderItem = ({item}: {item: ManhwaCard}) => {
        return <ManhwaRandomCard card={item} />
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