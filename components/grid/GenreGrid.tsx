import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import ViewAllButton from '../buttons/ViewAllButton'
import Title from '../Title'
import Row from '../util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'


interface GenreGridProps {
    genres: Genre[]
}


const Item = ({item}: {item: Genre}) => {
    
    const onPress = useCallback((genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }, [item.genre_id])
    
    return (
        <Pressable onPress={() => onPress(item)} style={AppStyle.defaultGridItem} >
            <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >{item.genre}</Text>
        </Pressable>
    )
}


const GenreGrid = ({genres}: GenreGridProps) => {


    const viewAllGenres = () => {
        router.navigate("/(pages)/GenresPage")
    }    

    if (genres.length === 0) { return <></> }

    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Genres'/>
                <ViewAllButton onPress={viewAllGenres} />
            </Row>
            <FlatList
                data={genres}
                horizontal={true}
                initialNumToRender={10}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.genre}
                renderItem={({item}) => <Item item={item} />}
            />
        </View>
    )
}

export default GenreGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: AppConstants.COMMON.GAP,
        alignItems: "flex-start"
    }
})

