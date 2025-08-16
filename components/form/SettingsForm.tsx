import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { clearCache, formatBytes, getYesterday, hasOnlyDigits, wp } from '@/helpers/util';
import { dbCreateSafeModePassword, dbSetCacheSize, dbSetSafeModeState } from '@/lib/database';
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
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import RNRestart from 'react-native-restart';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import Row from '../util/Row';
import Footer from '../util/Footer';
import { FontSizes, Typography } from '@/constants/typography';
import TopBar from '../TopBar';
import ChapterLink from '../chapter/ChapterLink';
import Checkmark from '../util/Checkmark';
import UiForm from './UiForm';


interface FormData {
    maxCacheSize: number
    safeModePassword: string
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
    safeModePassword: string
    safeModeOn: boolean
} 


const SettingsForm = ({currentMaxCacheSize, currentCacheSize, safeModePassword, safeModeOn}: SettingsFormProps) => {
        
    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)
    const [currentSafeModePassword, setCurrentSafeModePassword] = useState(safeModePassword)
    const [confirmPassword, setConfirmPassword] = useState(safeModePassword)
    const [isSafeModeOn, setIsSafeModeOn] = useState(safeModeOn)
    const [loadingSafeModeConfig, setLoadingSafeModeConfig] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            maxCacheSize: currentMaxCacheSize            
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        if (
            form_data.maxCacheSize < AppConstants.FORM.SETTINGS.MIN_CACHE_SIZE ||
            form_data.maxCacheSize > AppConstants.FORM.SETTINGS.MAX_CACHE_SIZE
        ) { return }
        setLoading(true)
            await dbSetCacheSize(db, form_data.maxCacheSize * 1024 * 1024)
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };

    const clearAppCache = async () => {
        Keyboard.dismiss()
        await clearCache()
        RNRestart.Restart();
    }

    const isValidPassword = (p: string): boolean  => {
        return p.trim().length >= 4 && hasOnlyDigits(p)
    }

    const submitPassword = async () => {
        Keyboard.dismiss()
        setLoadingSafeModeConfig(true)
            const check1 = isValidPassword(currentSafeModePassword)
            const check2 = isValidPassword(confirmPassword)
            const check3 = currentSafeModePassword.trim() === confirmPassword.trim()
            if (!(check1 && check2 && check3)) {
                Toast.show({
                    text1: "Invalid Password", 
                    text2: "Min 4 characters and passwords must match", 
                    type: 'error', 
                    visibilityTime: 3500
                })
                setLoadingSafeModeConfig(false)
                return
            } 
            await dbCreateSafeModePassword(db, currentSafeModePassword.trim())
            if (isSafeModeOn) {
                setIsSafeModeOn(false)
                await dbSetSafeModeState(db, false)
                Toast.show({text1: "Safe Mode Disabled!", type: "success"})
            } else {
                setIsSafeModeOn(true)
                await dbSetSafeModeState(db, true)
                Toast.show({text1: "Safe Mode Enabled!", type: "success"})
            }            
        setLoadingSafeModeConfig(false)
    }

    return (        
        <>
            <Row style={{gap: AppConstants.COMMON.GAP, alignSelf: 'flex-start'}} >
                <Text style={Typography.semibold}>Safe Mode</Text>
                <Text style={{...AppStyle.error, alignSelf: "center"}}>{isSafeModeOn ? 'enabled' : 'disabled'}</Text>
            </Row>

            <Text style={Typography.regular}>When safe mode is enabled, {AppConstants.COMMON.APP_NAME} will function as a simple to-do list. To unlock the main content, you will need the numeric password you define below.</Text>
            <Text style={{...Typography.regular, color: Colors.neonRed}}>If you forget the password, it cannot be reset or recovered. You must delete the app data via {Platform.OS} settings to regain access to the main content.</Text>
            <Text style={{...Typography.regular, color: Colors.neonRed}}>Changes to Safe Mode settings will be applied when the app restarts.</Text>
            
            <Text style={Typography.regular} >Password</Text>
            <TextInput
                style={AppStyle.input}
                keyboardType='numeric'
                onChangeText={setCurrentSafeModePassword}
                value={currentSafeModePassword.toString()}/>

            <Text style={Typography.regular} >Confirm Password</Text>
            <TextInput
                style={AppStyle.input}
                keyboardType='numeric'
                onChangeText={setConfirmPassword}
                value={confirmPassword.toString()}/>

            {
                loadingSafeModeConfig ?
                <View style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{safeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                </View>
                :
                <Pressable onPress={submitPassword} style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{isSafeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                </Pressable>

            }
                            
            <Text style={Typography.semibold}>Cache size: {formatBytes(currentCacheSize)}</Text>
            <Text style={AppStyle.error}>* Restart Required</Text>                    
            {/* Clear Cache */}
            <Pressable onPress={clearAppCache} style={AppStyle.formButton} >
                <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Clear Cache</Text>
            </Pressable>                
        
            {/* Cache Size */}
            <Text style={Typography.semibold}>Max cache size (MB)</Text>
            {errors.maxCacheSize && (<Text style={AppStyle.error}>{errors.maxCacheSize.message}</Text>)}
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
            {/* Save Button */}
            {
                isLoading ?
                <View style={AppStyle.formButton} >
                    <ActivityIndicator size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
                </View> 
                :
                <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                </Pressable>
            }

            <UiForm/>

            <Footer height={62}/>
        </>
    )
}

export default SettingsForm
