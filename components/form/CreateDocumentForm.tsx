import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { spRequestManhwa } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
    name: yup
        .string()
        .min(AppConstants.FORM.DOCUMENT.NAME_MIN_LENGTH, `Min ${AppConstants.FORM.DOCUMENT.NAME_MIN_LENGTH} characters`)
        .max(AppConstants.FORM.DOCUMENT.NAME_MAX_LENGTH, `Max ${AppConstants.FORM.DOCUMENT.NAME_MAX_LENGTH} characters`)
        .required('Document name is required'),
    descr: yup
        .string()
        .max(AppConstants.FORM.DOCUMENT.DESCR_MAX_LENGTH, `Max ${AppConstants.FORM.DOCUMENT.DESCR_MAX_LENGTH} characters`)
});


interface FormData {
    name: string
    descr: string
}


interface CreateDocumentFormProps {
    createDocumentFunc: (data: FormData) => any
}


const CreateDocumentForm = ({createDocumentFunc}: CreateDocumentFormProps) => {
        
    const [isLoading, setLoading] = useState(false)
    const inputRef1 = useRef<TextInput>(null)
    const inputRef2 = useRef<TextInput>(null)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: '',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        inputRef1.current?.clear()
        inputRef2.current?.clear()
        setLoading(true)
        await createDocumentFunc(form_data)
        setLoading(false)
    };

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <View style={{flex: 1}}>
                {/* Name */}
                <Text style={AppStyle.inputHeaderText}>Name</Text>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        ref={inputRef1}
                        style={AppStyle.input}
                        autoCapitalize="words"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
                {errors.name && (<Text style={AppStyle.error}>{errors.name.message}</Text>)}

                {/* Description */}
                <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                    <Text style={AppStyle.inputHeaderText}>Description</Text>
                    <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.documentsColor}]}>optional</Text>
                </View>
                <Controller
                    name="descr"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        ref={inputRef2}
                        style={[AppStyle.input, {height: hp(10), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                        multiline={true}
                        autoCapitalize="sentences"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
                {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            
        
                {/* Create Button */}
                {
                    isLoading ?
                    <View style={[AppStyle.formButton, {backgroundColor: Colors.documentsColor}]} >
                        <ActivityIndicator size={32} color={Colors.gray} />
                    </View> 
                    :
                    <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.documentsColor}]} >
                        <Text style={[AppStyle.formButtonText, {color: Colors.gray}]} >Create</Text>
                    </Pressable>
                }

                <View style={{width: '100%', height: 60}} />
            </View>
        </KeyboardAvoidingView>
    )
}

export default CreateDocumentForm
