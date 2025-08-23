import { dbReadManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import { FontSizes, Typography } from '@/constants/typography';
import React, { useEffect, useRef, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { AppConstants } from '@/constants/AppConstants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '@/constants/Colors';
import { hp } from '@/helpers/util';


interface AddToLibrayProps {
    manhwa: Manga,
    backgroundColor?: string    
}


const AddToLibray = ({manhwa, backgroundColor = Colors.primary}: AddToLibrayProps) => {

    const db = useSQLiteContext()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    const dbValue = useRef('')

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

    return (
        <View style={{flex: 1}} >
            <DropDownPicker
                open={open}
                style={{...styles.dropDownContainer, backgroundColor}}
                dropDownContainerStyle={{...styles.dropDownContainerStyle, borderColor: backgroundColor}}
                labelStyle={{color: Colors.backgroundColor}}
                textStyle={Typography.regular}
                showArrowIcon={true}
                ArrowUpIconComponent={() => {return <Ionicons name='chevron-up' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />}}
                ArrowDownIconComponent={() => {return <Ionicons name='chevron-down' size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />}}
                placeholder='Add To Library'
                placeholderStyle={{...Typography.regular, color: Colors.backgroundColor}}
                value={value as any}
                items={items}
                listItemContainerStyle={{height: FontSizes.sm * 2}}
                TickIconComponent={() => <Ionicons name='checkmark' size={FontSizes.sm} color={backgroundColor} />}
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

export default AddToLibray

const styles = StyleSheet.create({
    dropDownContainer: {
        height: AppConstants.BUTTON.SIZE,
        borderRadius: AppConstants.BORDER_RADIUS,
        gap: AppConstants.GAP,
        borderWidth: 0
    },
    dropDownContainerStyle: {
        backgroundColor: Colors.backgroundColor,
        borderWidth: 2        
    }
})