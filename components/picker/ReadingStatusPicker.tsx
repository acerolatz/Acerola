import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'


interface ReadingStatusPickerProps {
    onChangeValue: (v: any) => void
}


const ReadingStatusPicker = ({onChangeValue}: ReadingStatusPickerProps) => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('Reading')
    const [items, setItems] = useState(
        AppConstants.COMMON.READING_STATUS.map(i => {return {label: i, value: i}})
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
    dropDownContainer: {
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.primary,
        borderWidth: 0
    },
    dropDownContainerStyle: {
        backgroundColor: Colors.backgroundColor, 
        borderWidth: 2, 
        borderColor: Colors.primary
    }
})