import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyle'
import { BugType } from '@/helpers/types'
import { Colors } from '@/constants/Colors'


const BugItem = ({item, isSelected, onChange}: {item: BugType, isSelected: boolean, onChange: (b: BugType) => any}) => {
    
    const onPress = () => { onChange(item) }

    const backgroundColor = isSelected ? Colors.BugReportColor : Colors.backgroundSecondary
    const color = isSelected ? Colors.backgroundColor : Colors.white

    return (
        <Pressable
        onPress={onPress}
        style={[ styles.bugItem, {backgroundColor}]} >
            <Text style={[AppStyle.textRegular, {color}]} >{item}</Text>
        </Pressable>
    )
}

const BugTypePicker = ({value, onChange}: {value: BugType, onChange: (b: BugType) => any}) => {
    return (
        <View style={styles.container} >
            <FlatList
                data={AppConstants.COMMON.BUT_TYPE_LIST as BugType[]}
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
        width: '100%', 
        height: 52
    },
    bugItem: {
        height: 42,
        alignItems: "center", 
        justifyContent: "center", 
        paddingHorizontal: 12, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        marginRight: AppConstants.COMMON.MARGIN,
    }
})