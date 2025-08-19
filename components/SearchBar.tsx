import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef } from 'react'
import { 
    Pressable, 
    TextInput, 
    View, 
    ViewStyle 
} from 'react-native'


interface SearchBarProps {
    onChangeText: (text: string) => any
    placeholder?: string
    color?: string
    style?: ViewStyle
}


/**
 * SearchBar component with a clear button.
 *
 * Renders a TextInput with an optional placeholder and color. Includes
 * a clear icon to reset the input and trigger `onChangeText` with an
 * empty string.
 *
 * @param onChangeText - Callback triggered whenever the input text changes.
 * @param placeholder - Optional placeholder text. Defaults to `'search'`.
 * @param color - Optional text and icon color. Defaults to `Colors.primary`.
 * @param style - Optional ViewStyle to customize container styling.
 *
 * @example
 * <SearchBar 
 *   placeholder="Search manhwas..."
 *   color={Colors.yellow}
 *   onChangeText={(text) => console.log(text)} 
 * />
 *
 * @remarks
 * - Uses `AppStyle.input` for the TextInput styling.
 * - `AppConstants.HIT_SLOP.LARGE` is applied to the clear button for easier tapping.
 * - The clear button resets the TextInput and triggers `onChangeText('')`.
 */
const SearchBar = ({ 
    onChangeText, 
    style, 
    placeholder = 'search', 
    color = Colors.primary 
}: SearchBarProps) => {    

    const inputRef = useRef<TextInput>(null)

    const clearText = () => {
        inputRef.current?.clear()
        onChangeText('')
    }

    return (
        <View style={[{width: '100%'}, style]} >
            <TextInput
                ref={inputRef}
                placeholder={placeholder}
                placeholderTextColor={color}
                style={[AppStyle.input, {color, paddingRight: AppConstants.ICON.SIZE * 2}]}
                onChangeText={onChangeText}
            />
            <Pressable 
                style={AppStyle.iconCenter}
                onPress={clearText} 
                hitSlop={AppConstants.HIT_SLOP.LARGE} >
                <Ionicons name='close-circle-outline' size={AppConstants.ICON.SIZE} color={color} />
            </Pressable>
        </View>
    )
}

export default SearchBar