import { useManhwaCardsState } from '@/store/randomManhwaState'
import React, { useCallback, useMemo, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import RotatingButton from '../buttons/RotatingButton'
import RandomManhwaCard from '../RandomManhwaCard'
import { ManhwaCard } from '@/helpers/types'
import { debounce } from 'lodash'
import Row from '../util/Row'
import Title from '../Title'


interface RandomCardsGridProps {
    reloadCards: () => any
}


const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlatList<ManhwaCard>>(null)

    const reload = useCallback(async () => {
        await reloadCards()
        flatListRef.current?.scrollToIndex({ index: 0, animated: true })
    }, [reloadCards])

    const debounceReload = useMemo(() => debounce(reload, 800), [reload])

    const renderItem = useCallback(({item}: {item: ManhwaCard}) => (
        <RandomManhwaCard card={item} />
    ), [])

    const keyExtractor = useCallback((item: ManhwaCard) => item.manhwa_id.toString(), [])

    const ItemSeparator = useCallback(() => <View style={{ width: AppConstants.MARGIN }} />, [])

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
            {
                cards.length > 0 && (
                    <FlatList
                        ref={flatListRef}
                        data={cards}
                        windowSize={3}
                        maxToRenderPerBatch={5}
                        updateCellsBatchingPeriod={100}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ItemSeparatorComponent={ItemSeparator}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                    />
                )
            }
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
    }    
})