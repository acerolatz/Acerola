import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import React, { useCallback } from 'react'


const Item = ({item, isLast}: {item: string, isLast: boolean}) => {
    const t = !isLast ? ',' : ''
    return <Text key={item} style={styles.item}> {item}{t} </Text>
}


interface AltNamesProps {
    names: string[]
}


const ManhwaAlternativeNames = ({names}: AltNamesProps) => {

    const renderItem = useCallback(({item, index}: {item: string, index: number}) => {
        return <Item item={item} isLast={index >= names.length - 1} />
    }, [])

    const KeyExtractor = useCallback((item: string) => item, [])

    if (names.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <FlatList
                data={names}
                showsHorizontalScrollIndicator={false}
                keyExtractor={KeyExtractor}
                horizontal={true}
                renderItem={renderItem}
            />
        </View>
    )
}

export default ManhwaAlternativeNames

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        alignItems: "flex-start"
    },
    item: {
        ...Typography.light, 
        marginRight: 6
    }
})
