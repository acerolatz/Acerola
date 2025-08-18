import { useManhwaCardsState } from '@/store/randomManhwaState'
import { FlatList, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import RotatingButton from '../buttons/RotatingButton'
import RandomManhwaCard from '../RandomManhwaCard'
import { ManhwaCard } from '@/helpers/types'
import React, { useRef } from 'react'
import { debounce } from 'lodash'
import Row from '../util/Row'
import Title from '../Title'


interface RandomCardsGridProps {
    reloadCards: () => any
}


const RandomCardsGrid = ({reloadCards}: RandomCardsGridProps) => {
    
    const { cards } = useManhwaCardsState()
    const flatListRef = useRef<FlatList<ManhwaCard>>(null)

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
            <FlatList
                ref={flatListRef}
                data={cards}
                initialNumToRender={6}
                ItemSeparatorComponent={() => <View style={{ width: AppConstants.MARGIN }} />}
                onEndReachedThreshold={1}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                renderItem={({item}) => <RandomManhwaCard card={item} />}
            />
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