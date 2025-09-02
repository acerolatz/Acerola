import { FlatList, Text, View } from 'react-native'
import { Typography } from '@/constants/typography'
import React, { useCallback } from 'react'


const Item = ({item, isLast}: {item: string, isLast: boolean}) => {
    return (
        <Text key={item} style={{...Typography.light, marginRight: 6}}>
            {item}{!isLast ? ',' : ''}
        </Text>
    )
}


interface AltNamesProps {
    names: string[]
}

const ManhwaAlternativeNames = ({names}: AltNamesProps) => {

    const renderItem = useCallback(({item, index}: {item: string, index: number}) => {
        return <Item item={item} isLast={index >= names.length - 1} />
    }, [])

    if (names.length === 0) {
        return <></>
    }    

    return (
        <View style={{width: '100%', alignItems: "flex-start"}} >
            <FlatList
                data={names}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                horizontal={true}
                renderItem={renderItem}
            />
        </View>
    )
}

export default ManhwaAlternativeNames
