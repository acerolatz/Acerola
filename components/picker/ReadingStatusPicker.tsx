import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'


interface ReadingStatusPickerProps {
    onChangeValue: (v: any) => void
    defaultValue?: string
    backgroundColor?: string
}


const ReadingStatusPicker = ({
    onChangeValue,
    defaultValue = 'Reading',
    backgroundColor = Colors.libraryColor
}: ReadingStatusPickerProps) => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(defaultValue)
    const [items, setItems] = useState(
        AppConstants.COMMON.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    return (
        <DropDownPicker
            open={open}
            style={[styles.dropDownContainer, {backgroundColor}]}
            dropDownContainerStyle={{backgroundColor: Colors.backgroundColor, borderWidth: 2, borderColor: backgroundColor}}
            labelStyle={{color: Colors.backgroundColor}}                
            textStyle={styles.text}
            placeholder='Reading Status'
            placeholderStyle={styles.placeholderText}
            ArrowUpIconComponent={() => {return <Ionicons name='chevron-up' size={20} color={Colors.backgroundColor} />}}
            ArrowDownIconComponent={() => {return <Ionicons name='chevron-down' size={20} color={Colors.backgroundColor} />}}
            value={value as any}
            showArrowIcon={true}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            listMode='SCROLLVIEW'
            theme="DARK"                
            onChangeValue={onChangeValue}
            multiple={false}
            mode="SIMPLE"
        />
    )
}

export default ReadingStatusPicker


const styles = StyleSheet.create({
    text: {
        fontFamily: "LeagueSpartan_400Regular", 
        fontSize: 18
    },
    placeholderText: {
        color: Colors.white, 
        fontSize: 18, 
        fontFamily: "LeagueSpartan_400Regular"
    },
    dropDownContainer: {
        height: 52, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        borderWidth: 0
    }
})