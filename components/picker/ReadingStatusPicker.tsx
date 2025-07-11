import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
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
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    return (
        <DropDownPicker
            open={open}
            style={{height: 52, backgroundColor, borderRadius: 4}}
            dropDownContainerStyle={{backgroundColor: Colors.gray}}
            labelStyle={{color: Colors.backgroundColor}}                
            textStyle={{fontFamily: "LeagueSpartan_400Regular", fontSize: 18}}
            placeholder='Reading Status'
            placeholderStyle={{color: Colors.white, fontSize: 18, fontFamily: "LeagueSpartan_400Regular"}}
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
