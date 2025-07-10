import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef } from 'react'
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native'


interface SearchBarProps {
    onChangeValue: (value: string) => any
    color?: string
    style?: ViewStyle
}


const SearchBar = ({ onChangeValue, style, color = 'white' }: SearchBarProps) => {    

    const inputRef = useRef<TextInput>(null)

    const clearText = () => {
        inputRef.current?.clear()
        onChangeValue('')
    }

    return (
        <View style={[{width: '100%'}, style]} >
            <TextInput
                ref={inputRef}
                placeholder='search'
                placeholderTextColor={color}
                style={[styles.input, {color}]}
                onChangeText={onChangeValue}
            />
            <Pressable 
                style={styles.icon}
                onPress={clearText} 
                hitSlop={AppConstants.hitSlopLarge} >
                <Ionicons name='close-circle-outline' size={28} color={color} />
            </Pressable>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({
    input: {
        paddingHorizontal: 10,
        height: 52,
        borderRadius: 4,
        backgroundColor: Colors.gray,
        fontSize: 18,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular"
    },
    icon: {
        position: 'absolute', 
        height: '100%', 
        right: 10, 
        alignItems: "center", 
        justifyContent: "center"
    }
})