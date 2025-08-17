import { ManhwaCard } from '@/helpers/types'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { debounce } from 'lodash'
import React, { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { FlashList } from '@shopify/flash-list'
import { wp } from '@/helpers/util'
import RandomManhwaCard from '../RandomManhwaCard'


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
                    ItemSeparatorComponent={() => <View style={{ width: AppConstants.MARGIN }} />}
                    drawDistance={wp(120)}
                    onEndReachedThreshold={3}
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
    container: {
        flex: 1,
        gap: AppConstants.GAP
    },    
    gridContainer: {
        flex: 1, 
        height: AppConstants.RANDOM_MANHWAS.MAX_HEIGHT
    }    
})