import { Manhwa } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import ManhwaCard from '../ManhwaCard'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'
import Row from '../util/Row'


interface ManhwaHorizontalGridProps {    
    title: string
    manhwas: Manhwa[]
    onViewAll: () => void
}


const ManhwaHorizontalGrid = ({
    title,
    manhwas,
    onViewAll
}: ManhwaHorizontalGridProps) => {
    if (manhwas.length === 0)  { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title={title}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <FlashList
                data={manhwas}
                horizontal={true}
                estimatedItemSize={wp(80)}
                drawDistance={wp(140)}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item: Manhwa) => item.manhwa_id.toString()}
                renderItem={({item}) => <ManhwaCard manhwa={item} marginRight={4} />}
            />
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 20
    }
})