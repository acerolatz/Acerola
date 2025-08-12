import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { clearCache, formatBytes, hasOnlyDigits } from '@/helpers/util';
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
    Text,
    TextInput,
    View
} from 'react-native';
import RNRestart from 'react-native-restart';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import Row from '../util/Row';
import Footer from '../util/Footer';


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
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} >
                <View style={{gap: 20}} >
                    <View>
                        <Row style={{gap: 10, alignSelf: 'flex-start'}} >
                            <Text style={AppStyle.inputHeaderText}>Safe Mode</Text>
                            <Text style={[AppStyle.inputHeaderText, {color: Colors.neonRed}]}>{isSafeModeOn ? 'enabled' : 'disabled'}</Text>
                        </Row>
                        <Text style={AppStyle.textRegular}>When safe mode is enabled, {AppConstants.COMMON.APP_NAME} will function as a simple to-do list. To unlock the main content, you will need the numeric password you define below.</Text>
                        <Text style={[AppStyle.textRegular, {color: Colors.neonRed}]}>If you forget the password, it cannot be reset or recovered. You must delete the app data via {Platform.OS} settings to regain access to the main content.</Text>
                        <Text style={[AppStyle.textRegular, {color: Colors.neonRed}]}>Changes to Safe Mode settings will be applied when the app restarts.</Text>
                        
                        <Text style={AppStyle.inputHeaderText} >Safe Mode Password</Text>
                        <TextInput
                            style={AppStyle.input}
                            keyboardType='numeric'
                            onChangeText={setCurrentSafeModePassword}
                            value={currentSafeModePassword.toString()}/>

                        <Text style={AppStyle.inputHeaderText} >Confirm Safe Mode Password</Text>
                        <TextInput
                            style={AppStyle.input}
                            keyboardType='numeric'
                            onChangeText={setConfirmPassword}
                            value={confirmPassword.toString()}/>

                        {
                            loadingSafeModeConfig ?
                            <View style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{safeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                            </View>
                            :
                            <Pressable onPress={submitPassword} style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{isSafeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                            </Pressable>

                        }                        
                    </View>

                    <View style={{width: '100%', height: 2, backgroundColor: Colors.white, borderRadius: AppConstants.COMMON.BORDER_RADIUS}} />
                    
                    <View>
                        <Text style={AppStyle.inputHeaderText}>Cache size: {formatBytes(currentCacheSize)}</Text>
                        {/* Clear Cache */}
                        <Pressable onPress={clearAppCache} style={[AppStyle.formButton, {backgroundColor: Colors.white, marginTop: 0}]} >
                            <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >Clear Cache</Text>
                        </Pressable>                
                        <Text style={[AppStyle.textRegular, {color: Colors.neonRed, marginTop: 6}]}>* Restart Required</Text>
                    </View>

                    <View style={{width: '100%', height: 2, backgroundColor: Colors.white, borderRadius: AppConstants.COMMON.BORDER_RADIUS}} />
                    
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
                                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >Save</Text>
                            </Pressable>
                        }
                    </View>
                    <Footer/>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SettingsForm
