import { FontSizes, Typography } from '@/constants/typography'
import DropDownPicker from 'react-native-dropdown-picker'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import {  StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { hp } from '@/helpers/util'


interface ReadingStatusPickerProps {
    onChangeValue: (v: any) => void
    isActive: boolean
}


const ReadingStatusPicker = ({onChangeValue, isActive}: ReadingStatusPickerProps) => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('Reading')
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    return (
        <DropDownPicker
            open={open}
            style={styles.dropDownContainer}
            dropDownContainerStyle={styles.dropDownContainerStyle}
            labelStyle={{color: Colors.backgroundColor}}
            textStyle={Typography.regular}
            placeholderStyle={Typography.regular}
            ArrowUpIconComponent={() => {return <Ionicons name='chevron-up' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />}}
            ArrowDownIconComponent={() => {return <Ionicons name='chevron-down' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />}}
            value={value as any}
            showArrowIcon={true}
            listItemContainerStyle={{height: FontSizes.sm * 2}}
            TickIconComponent={() => <Ionicons name='checkmark' size={FontSizes.sm} color={Colors.primary} />}
            maxHeight={hp(40)}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            disabled={!isActive}
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
    dropDownContainer: {
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.BORDER_RADIUS,
        backgroundColor: Colors.primary,
        borderWidth: 0
    },
    dropDownContainerStyle: {
        backgroundColor: Colors.backgroundColor, 
        borderWidth: 2, 
        borderColor: Colors.primary
    }
})