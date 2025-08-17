import { useManhwaCardsState } from '@/store/randomManhwaState'
import RotatingButton from '../buttons/RotatingButton'
import { AppConstants } from '@/constants/AppConstants'
import RandomManhwaCard from '../RandomManhwaCard'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ManhwaCard } from '@/helpers/types'
import React, { useRef } from 'react'
import { wp } from '@/helpers/util'
import { debounce } from 'lodash'
import Row from '../util/Row'
import Title from '../Title'


interface RandomCardsGridProps {
    reloadCards: () => any
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
                <Row style={styles.header} >
                    <Title title='Random'/>
                    <RotatingButton onPress={debounceReload} />
                </Row>
            </View>
        )
    }
    
    return (
        <View style={styles.container} >
            <Row style={styles.header} >
                <Title title='Random'/>
                <RotatingButton onPress={debounceReload} />
            </Row>
            <View style={styles.gridContainer} >
                <FlashList
                    ref={flatListRef}
                    data={cards}
                    ItemSeparatorComponent={() => <View style={{ width: AppConstants.MARGIN }} />}
                    drawDistance={wp(100)}
                    onEndReachedThreshold={1}
                    estimatedItemSize={AppConstants.RANDOM_MANHWAS.MAX_WIDTH}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                    renderItem={({item}) => <RandomManhwaCard card={item} />}
                />
            </View>
        </View>
    )
}

export default RandomCardsGrid

const styles = StyleSheet.create({
    header: {
        width: '100%', 
        justifyContent: "space-between"
    },
    container: {
        flex: 1,
        gap: AppConstants.GAP
    },    
    gridContainer: {
        flex: 1, 
        height: AppConstants.RANDOM_MANHWAS.MAX_HEIGHT
    }    
})