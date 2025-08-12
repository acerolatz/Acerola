import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { spRequestManhwa } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
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
import Toast from 'react-native-toast-message';
import * as yup from 'yup';


const schema = yup.object().shape({  
    manga_title: yup
        .string()
        .min(AppConstants.FORM.MANHWA_REQUEST.TITLE_MIN_LENGTH, `Min ${AppConstants.FORM.MANHWA_REQUEST.TITLE_MIN_LENGTH} characters`)
        .max(AppConstants.FORM.MANHWA_REQUEST.TITLE_MAX_LENGTH, `Max ${AppConstants.FORM.MANHWA_REQUEST.TITLE_MAX_LENGTH} characters`)
        .required('Manga name is required'),
    descr: yup
        .string()
        .max(AppConstants.FORM.MANHWA_REQUEST.DESCR_MAX_LENGTH, `Max ${AppConstants.FORM.MANHWA_REQUEST.DESCR_MAX_LENGTH} characters`)
});


interface FormData {
    manga_title: string
    descr: string
}


const RequestManhwaForm = () => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            manga_title: '',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            const m = form_data.descr.trim() == '' ? null : form_data.descr.trim()
            await spRequestManhwa(form_data.manga_title, m)
            Keyboard.dismiss()
            Toast.show(ToastMessages.EN.MANHWA_REQUEST_THANKS)
            router.back()
        setLoading(false)
    };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always' >
            {/* Manga Name */}
            <Text style={AppStyle.inputHeaderText}>Manhwa</Text>
            {errors.manga_title && (<Text style={AppStyle.error}>{errors.manga_title.message}</Text>)}
            <Controller
                control={control}
                name="manga_title"
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
            <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                <Text style={AppStyle.inputHeaderText}>Message</Text>
                <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.requestMangaColor}]}>optional</Text>
            </View>
            {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            
            <Controller
                name="descr"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={[AppStyle.input, {height: hp(10), paddingVertical: 10, textAlignVertical: 'top'}]}                    
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
                <View style={[AppStyle.formButton, {backgroundColor: Colors.requestMangaColor}]} >
                    <ActivityIndicator size={32} color={Colors.backgroundColor} />
                </View> 
                :
                <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.requestMangaColor}]} >
                    <Text style={AppStyle.formButtonText} >Send</Text>
                </Pressable>
            }

            <View style={{width: '100%', height: 60}} />
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RequestManhwaForm
