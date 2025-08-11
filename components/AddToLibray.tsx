import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Manhwa } from '@/helpers/types';
import { dbGetManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';


interface AddToLibrayProps {
    manhwa: Manhwa,
    backgroundColor?: string
    textColor?: string
}


const AddToLibray = ({
    manhwa,
    backgroundColor = Colors.libraryColor, 
    textColor = Colors.backgroundColor
}: AddToLibrayProps) => {

    const db = useSQLiteContext()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
    const [items, setItems] = useState(
        AppConstants.COMMON.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    const dbValue = useRef('')

    useEffect(
        () => {
            async function init() {
                const value = await dbGetManhwaReadingStatus(db, manhwa.manhwa_id)                    
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
        <View style={{flex: 1, height: 52}} >
            <DropDownPicker
                open={open}
                style={[styles.dropDownContainer, {backgroundColor}]}
                dropDownContainerStyle={{backgroundColor: Colors.backgroundColor, borderWidth: 2, borderColor: backgroundColor}}
                labelStyle={{color: textColor}}
                textStyle={styles.text}
                showArrowIcon={true}
                ArrowUpIconComponent={() => {return <Ionicons name='chevron-up' size={20} color={Colors.backgroundColor} />}}
                ArrowDownIconComponent={() => {return <Ionicons name='chevron-down' size={20} color={Colors.backgroundColor} />}}
                placeholder='Add To Library'
                placeholderStyle={[styles.placeholder, {color: textColor}]}
                value={value as any}
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
        </View>
    )
}

export default AddToLibray

const styles = StyleSheet.create({
    placeholder: {        
        fontSize: 18, 
        fontFamily: "LeagueSpartan_400Regular"
    },
    text: {
        fontFamily: "LeagueSpartan_400Regular", 
        fontSize: 18, 
        color: Colors.white
    },
    dropDownContainer: {
        height: 52,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        borderWidth: 0
    }    
})