import { 
    Keyboard, 
    Pressable, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    View 
} from 'react-native'
import React, { useState } from 'react'
import { useSettingsState } from '@/store/settingsState'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbSetNumericInfo } from '@/lib/database'
import { wp } from '@/helpers/util'
import { Colors } from '@/constants/Colors'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import Footer from '../util/Footer'


interface FormData {
    drawDistance: number
    onEndReachedThreshold: number
}

const schema = yup.object().shape({  
    drawDistance: yup
        .number()
        .min(AppConstants.COMMON.SCREEN_WIDTH, `Min ${AppConstants.COMMON.SCREEN_WIDTH} pixels`)
        .max(AppConstants.COMMON.SCREEN_WIDTH * 20, `Max ${AppConstants.COMMON.SCREEN_WIDTH * 20} pixels`)
        .required('DrawDistance is required'),

    onEndReachedThreshold: yup
        .number()
        .min(0.5, 'Min 0.5')
        .max(64, 'Max 64')
});

const PerformanceUIForm = () => {

    const db = useSQLiteContext()
    const { settings, setSettings  } = useSettingsState()

    const [loading, setLoading] = useState(false)    

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            drawDistance: settings.drawDistance,
            onEndReachedThreshold: settings.onEndReachedThreshold
        },
    });

    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            Keyboard.dismiss()
            setSettings({
                ...settings, 
                drawDistance: form_data.drawDistance, 
                onEndReachedThreshold: form_data.onEndReachedThreshold
            })
            await dbSetNumericInfo(db, 'drawDistance', form_data.drawDistance)
            await dbSetNumericInfo(db, 'onEndReachedThreshold', form_data.onEndReachedThreshold)
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };
    
    return (        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
            <View style={{flex: 1, gap: AppConstants.COMMON.GAP, paddingHorizontal: wp(1)}} >
                {/* Draw Distance */}
                <View>
                    <Text style={Typography.semibold}>DrawDistance</Text>
                    <Text style={AppStyle.textOptional} >chapter reader</Text>
                </View>
                <Text style={Typography.regular}>Draw distance for advanced rendering (in px)</Text>
                {errors.drawDistance && (<Text style={AppStyle.error}>{errors.drawDistance.message}</Text>)}
                <Controller
                    name="drawDistance"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {/* On End Reached Threshold */}
                <View>
                    <Text style={Typography.semibold}>EndReachedThreshold</Text>
                    <Text style={AppStyle.textOptional} >chapter reader</Text>
                </View>
                <Text style={Typography.regular}>
                    How far from the end (in units of visible length of the list) the bottom edge of the list must be from the end of the content to trigger the onEndReached callback. Thus a value of 0.5 will trigger onEndReached when the end of the content is within half the visible length of the list.
                </Text>
                {errors.onEndReachedThreshold && (<Text style={AppStyle.error}>{errors.onEndReachedThreshold.message}</Text>)}
                <Controller
                    name="onEndReachedThreshold"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {
                    loading ?

                    <View style={AppStyle.formButton} >
                        <CustomActivityIndicator color={Colors.backgroundColor} />
                    </View>
                    :
                    <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >OK</Text>
                    </Pressable>
                }

            </View>
            <Footer/>
        </ScrollView>
    )
}

export default PerformanceUIForm

const styles = StyleSheet.create({})