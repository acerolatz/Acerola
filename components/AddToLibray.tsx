import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { Manhwa } from '@/helpers/types';
import { dbGetManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import { spUpdateManhwaReadingStatus } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';


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
    const { session } = useAuthState()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    const dbValue = useRef('')

    useEffect(
        () => {
            async function init() {
                await dbGetManhwaReadingStatus(db, manhwa.manhwa_id)
                .then(value => {
                    if (!value) { 
                        dbValue.current = ''
                        setValue(undefined)
                        return 
                    }
                    dbValue.current = value
                    setValue(value)
                })
            }
            init()
        },
        [db, manhwa]
    )

    const onChangeValue = async (value: string | null) => {        
        if (!session) {
            Toast.show(ToastMessages.EN.NOT_LOGGED_IN)
            return
        }
        if (!value || value === dbValue.current) { return }
        await dbUpdateManhwaReadingStatus(db, manhwa.manhwa_id, value)
        spUpdateManhwaReadingStatus(session.user.id, manhwa.manhwa_id, value)
    }

    return (
        <View style={{flex: 1, height: 52}} >
            <DropDownPicker
                open={open}
                style={{height: 52, borderRadius: 4, backgroundColor, borderWidth: 0}}
                dropDownContainerStyle={{backgroundColor: Colors.gray}}
                labelStyle={{color: textColor}}
                textStyle={{fontFamily: "LeagueSpartan_400Regular", fontSize: 18, color: Colors.white}}
                showArrowIcon={true}
                ArrowUpIconComponent={() => {return <Ionicons name='chevron-up' size={20} color={Colors.backgroundColor} />}}
                ArrowDownIconComponent={() => {return <Ionicons name='chevron-down' size={20} color={Colors.backgroundColor} />}}
                placeholder='Add To Library'
                placeholderStyle={{color: textColor, fontSize: 18, fontFamily: "LeagueSpartan_400Regular"}}
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
