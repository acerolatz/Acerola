import { AppConstants } from '@/constants/AppConstants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ToastMessages } from '@/constants/Messages';
import { Typography } from '@/constants/typography';
import { spSendRequestPornhwaForm } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { AppStyle } from '@/styles/AppStyle';
import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { router } from 'expo-router';
import Footer from '../util/Footer';
import * as yup from 'yup';
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


interface FormData {
    pornhwaTitle: string
    message: string
}

const schema = yup.object().shape({  
    pornhwaTitle: yup
        .string()
        .min(AppConstants.MANHWA_REQUEST.TITLE_MIN_LENGTH, `Min ${AppConstants.MANHWA_REQUEST.TITLE_MIN_LENGTH} characters`)
        .max(AppConstants.MANHWA_REQUEST.TITLE_MAX_LENGTH, `Max ${AppConstants.MANHWA_REQUEST.TITLE_MAX_LENGTH} characters`)
        .required('Manga name is required'),
    message: yup
        .string()
        .max(AppConstants.MANHWA_REQUEST.DESCR_MAX_LENGTH, `Max ${AppConstants.MANHWA_REQUEST.DESCR_MAX_LENGTH} characters`)
});


const RequestManhwaForm = () => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            pornhwaTitle: '',
            message: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        setLoading(true)
            const m = form_data.message.trim() == '' ? null : form_data.message.trim()
            await spSendRequestPornhwaForm(form_data.pornhwaTitle, m)
            Toast.show(ToastMessages.EN.THANKS)
            router.back()
        setLoading(false)
    };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
            <View style={{gap: AppConstants.GAP}} >
                {/* Manga Name */}
                <Text style={Typography.semibold}>Pornhwa</Text>
                {errors.pornhwaTitle && (<Text style={AppStyle.error}>{errors.pornhwaTitle.message}</Text>)}
                <Controller
                    control={control}
                    name="pornhwaTitle"
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        autoCapitalize="words"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />

                {/* Description */}
                <View style={{flexDirection: 'row', gap: AppConstants.GAP, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                    <Text style={Typography.semibold}>Message</Text>
                    <Text style={AppStyle.textOptional}>optional</Text>
                </View>
                {errors.message && (<Text style={AppStyle.error}>{errors.message.message}</Text>)}
                <Controller
                    name="message"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.inputMedium}
                        multiline={true}
                        autoCapitalize="sentences"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
        
                {/* Request Button */}
                {
                    isLoading ?
                    <View style={AppStyle.formButton} >
                        <ActivityIndicator size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
                    </View> 
                    :
                    <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Send</Text>
                    </Pressable>
                }

                <Footer/>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RequestManhwaForm