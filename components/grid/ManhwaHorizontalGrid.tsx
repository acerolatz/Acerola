import { Manhwa } from '@/helpers/types'
import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
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
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title={title}/>
                <ViewAllButton onPress={onViewAll} />
            </Row>
            <FlatList
                data={manhwas}
                horizontal={true}
                initialNumToRender={3}
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