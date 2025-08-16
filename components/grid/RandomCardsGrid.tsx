import { Manhwa, ManhwaCard } from '@/helpers/types'
import { spFetchManhwaById, spUpdateManhwaCardView } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { debounce } from 'lodash'
import React, { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'
import { useSQLiteContext } from 'expo-sqlite'
import { dbHasManhwa, dbUpsertManhwa } from '@/lib/database'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import { AppConstants } from '@/constants/AppConstants'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import { FlashList } from '@shopify/flash-list'
import { wp } from '@/helpers/util'
import { Typography } from '@/constants/typography'
import { LinearGradient } from 'expo-linear-gradient'



interface RandomCardsGridProps {
    reloadCards: () => any
}

const ManhwaRandomCard = ({card}: {card: ManhwaCard}) => {

    const db = useSQLiteContext()

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
            <View style={{
                width: card.normalizedWidth, 
                height: card.normalizedHeight, 
                alignItems: 'center',
                justifyContent: "center"
            }} >
                <CustomActivityIndicator/>
            </View>
        )
    }

    return (
        <Pressable onPress={() => onPress()} >
            <Image 
                source={card.image_url} 
                style={{
                    width: card.normalizedWidth,
                    height: card.normalizedHeight,
                    borderRadius: AppConstants.COMMON.BORDER_RADIUS
                }} 
                transition={AppConstants.COMMON.IMAGE_TRANSITION}
                contentFit='cover' />
            <LinearGradient colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.6)']} style={StyleSheet.absoluteFill} />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>{card.title}</Text>
            </View>
        </Pressable>
    )
}

const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlashList<ManhwaCard>>(null)

    const reload = async () => {
        await reloadCards()
        flatListRef.current?.scrollToIndex({index: 0, animated: true})
    }

    const debounceReload = debounce(reload, 800)    

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
            <View style={styles.gridContainer} >
                <FlashList
                    ref={flatListRef}
                    data={cards}
                    ItemSeparatorComponent={() => <View style={{ width: AppConstants.COMMON.MARGIN }} />}
                    drawDistance={wp(120)}
                    onEndReachedThreshold={3}
                    estimatedItemSize={AppConstants.COMMON.RANDOM_MANHWAS.MAX_WIDTH}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                    renderItem={({item}) => <ManhwaRandomCard card={item} />}
                />
            </View>
        </View>
    )
}

export default RandomCardsGrid

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: AppConstants.COMMON.GAP
    },    
    gridContainer: {
        flex: 1, 
        height: AppConstants.COMMON.RANDOM_MANHWAS.MAX_HEIGHT
    },
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(2),
        bottom: wp(2),
        paddingRight: wp(2)
    }
})