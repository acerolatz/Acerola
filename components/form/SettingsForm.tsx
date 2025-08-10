import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { clearCache, formatBytes } from '@/helpers/util';
import { dbGetCacheMaxSize, dbSetCacheSize } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import RNRestart from 'react-native-restart';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';


interface FormData {
    maxCacheSize: number
}


const schema = yup.object().shape({  
    maxCacheSize: yup
        .number()
        .min(AppConstants.FORM.SETTINGS.MIN_CACHE_SIZE, `Min ${AppConstants.FORM.SETTINGS.MIN_CACHE_SIZE} MB`)
        .max(AppConstants.FORM.SETTINGS.MAX_CACHE_SIZE, `Max ${AppConstants.FORM.SETTINGS.MAX_CACHE_SIZE} MB`)    
});

interface SettingsFormProps {
    currentMaxCacheSize: number
    currentCacheSize: number
} 


const SettingsForm = ({currentMaxCacheSize, currentCacheSize}: SettingsFormProps) => {
        
    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            maxCacheSize: currentMaxCacheSize,
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        if (
            form_data.maxCacheSize < AppConstants.FORM.SETTINGS.MIN_CACHE_SIZE ||
            form_data.maxCacheSize > AppConstants.FORM.SETTINGS.MAX_CACHE_SIZE
        ) {
            return
        }
        setLoading(true)
            await dbSetCacheSize(db, form_data.maxCacheSize * 1024 * 1024)
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };

    const clearAppCache = async () => {
        await clearCache()
        RNRestart.Restart();
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always' >
                <View style={{gap: 20}} >
                    <View>
                        <Text style={AppStyle.inputHeaderText}>Cache size: {formatBytes(currentCacheSize)}</Text>
                        {/* Clear Cache */}
                        <Pressable onPress={clearAppCache} style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                            <Text style={AppStyle.formButtonText} >Clear cache</Text>
                        </Pressable>                
                        <Text style={[AppStyle.textRegular, {color: Colors.neonRed, marginTop: 6}]}>* Restart Required</Text>
                    </View>
                    
                    <View>
                        {/* Cache Size */}
                        <Text style={AppStyle.inputHeaderText}>Max cache size (MB)</Text>
                        <Controller
                            control={control}
                            name="maxCacheSize"
                            render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={AppStyle.input}
                                keyboardType='numeric'
                                maxLength={AppConstants.FORM.SETTINGS.MAX_CACHE_SIZE.toString().length}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value.toString()}/>
                            )}
                        />
                        {errors.maxCacheSize && (<Text style={AppStyle.error}>{errors.maxCacheSize.message}</Text>)}
                        {/* Save Button */}
                        {
                            isLoading ?
                            <View style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                                <ActivityIndicator size={32} color={Colors.backgroundColor} />
                            </View> 
                            :
                            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                                <Text style={AppStyle.formButtonText} >Save</Text>
                            </Pressable>
                        }
                    </View>
                </View>
                
                <View style={{width: '100%', height: 52}} />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SettingsForm
