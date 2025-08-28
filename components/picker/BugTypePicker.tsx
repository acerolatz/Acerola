import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import { BugType } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'


const BugItem = ({item, isSelected, onChange}: {item: BugType, isSelected: boolean, onChange: (b: BugType) => any}) => {
    
    const onPress = () => { onChange(item) }

    const backgroundColor = isSelected ? Colors.primary : Colors.backgroundSecondary
    const color = isSelected ? Colors.backgroundColor : Colors.white

    return (
        <Pressable
            onPress={onPress}
            style={{...AppStyle.defaultGridItem, backgroundColor}} >
            <Text style={{...Typography.regular, color}} >{item}</Text>
        </Pressable>
    )
}

const BugTypePicker = ({value, onChange}: {value: BugType, onChange: (b: BugType) => any}) => {
    return (
        <View style={styles.container} >
            <FlatList
                data={AppConstants.LISTS.BUG_TYPE as BugType[]}
                horizontal={true}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => <BugItem isSelected={value === item} item={item} onChange={onChange} />}
            />
        </View>
    )
}

export default BugTypePicker

const styles = StyleSheet.create({
    container: {
        width: '100%'        
    }
})