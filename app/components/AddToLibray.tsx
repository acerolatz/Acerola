import { dbReadManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontSizes, Typography } from '@/constants/typography';
import DropDownPicker from 'react-native-dropdown-picker';
import { AppConstants } from '@/constants/AppConstants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import { Manhwa } from '@/helpers/types';
import { hp } from '@/helpers/util';


interface AddToLibrayProps {
    manhwa: Manhwa,
    backgroundColor?: string    
}


const AddToLibrary = ({manhwa, backgroundColor = Colors.primary}: AddToLibrayProps) => {

    const db = useSQLiteContext()
    const dbValue = useRef('')

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
    const [items, setItems] = useState(
        AppConstants.LISTS.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    useEffect(
        () => {
            async function init() {
                const value = await dbReadManhwaReadingStatus(db, manhwa.manhwa_id)                    
                if (!value) { 
                    dbValue.current = ''
                    setValue(undefined)
                    return
                }
                dbValue.current = value
                setValue(value)
            }
            init()
        },
        [db, manhwa]
    )

    const onChangeValue = async (value: string | null) => {        
        if (!value || value === dbValue.current) { return }
        await dbUpdateManhwaReadingStatus(db, manhwa.manhwa_id, value)
    }

    const arrowUp = useCallback(() => <Ionicons name='chevron-up' size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />, [])
    const arrowDown = useCallback(() => <Ionicons name='chevron-down' size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />, [])
    const tickIcon = useCallback(() => <Ionicons name='checkmark' size={FontSizes.sm} color={backgroundColor} />, [])

    return (
        <View style={AppStyle.flex} >
            <DropDownPicker
                open={open}
                style={{...styles.dropDownContainer, backgroundColor}}
                dropDownContainerStyle={{...styles.dropDownContainerStyle, borderColor: backgroundColor}}
                labelStyle={styles.labelStyle}
                textStyle={Typography.regular}
                showArrowIcon={true}
                ArrowUpIconComponent={arrowUp}
                ArrowDownIconComponent={arrowDown}
                placeholder='Add To Library'
                placeholderStyle={Typography.regularBlack}
                value={value as any}
                items={items}
                listItemContainerStyle={styles.listItemContainerStyle}
                TickIconComponent={tickIcon}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                listMode='SCROLLVIEW'            
                theme="DARK"                
                onChangeValue={onChangeValue}
                multiple={false}
                maxHeight={hp(40)}
                mode="SIMPLE"
            />
        </View>
    )
}

export default AddToLibrary

const styles = StyleSheet.create({
    labelStyle: {
        color: Colors.backgroundColor
    },
    listItemContainerStyle: {
        height: FontSizes.sm * 2
    },
    dropDownContainer: {
        height: AppConstants.UI.BUTTON.SIZE,
        borderRadius: AppConstants.UI.BORDER_RADIUS,
        gap: AppConstants.UI.GAP,
        borderWidth: 0
    },
    dropDownContainerStyle: {
        backgroundColor: Colors.backgroundColor,
        borderWidth: 2        
    }
})