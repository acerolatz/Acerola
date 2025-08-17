import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp, requestPermissions } from '@/helpers/util';
import { dbReadInfo } from '@/lib/database';
import { spReportBug, uploadBugScreenshot } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    FlatList,
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
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import Footer from '../util/Footer';
import { BugType } from '@/helpers/types';
import BugTypePicker from '../picker/BugTypePicker';
import BugImage from '../util/BugImage';
import { Typography } from '@/constants/typography';



const schema = yup.object().shape({  
    title: yup
        .string()
        .min(AppConstants.FORM.BUG_REPORT.TITLE_MIN_LENGTH, `Min ${AppConstants.FORM.BUG_REPORT.TITLE_MIN_LENGTH} characters`)
        .max(AppConstants.FORM.BUG_REPORT.TITLE_MAX_LENGTH, `Max ${AppConstants.FORM.BUG_REPORT.TITLE_MAX_LENGTH} characters`)
        .required('Title is required'),
    descr: yup
        .string()
        .max(AppConstants.FORM.BUG_REPORT.DESCR_MAX_LENGTH, `Max ${AppConstants.FORM.BUG_REPORT.DESCR_MAX_LENGTH} characters`),
    bugType: yup
        .string()
        .max(AppConstants.FORM.BUG_REPORT.BUG_TYPE_MAX_LENGTH, `Max ${AppConstants.FORM.BUG_REPORT.BUG_TYPE_MAX_LENGTH} characters`)    
});


interface FormData {
    title: string
    descr: string
    bugType: BugType
}


const BugReportForm = ({title}: {title: string | undefined | null}) => {
        
    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])

    const handleResponse = async (response: any) => {
        if (response.didCancel) {
            Toast.show(ToastMessages.EN.OPERATION_CANCELLED)
        } else if (response.errorCode) {
            Toast.show({text1: 'Error', text2: response.errorMessage, type: 'error'})      
        } else if (response.assets && response.assets.length > 0) {
            const { uri } = response.assets[0];
            setPhotos(prev => [...prev, ...[uri]])
        }
    };

    const handlePickPhoto = async () => {
        if (photos.length >= AppConstants.FORM.BUG_REPORT.MAX_IMAGES) {
            Toast.show({
                text1: "Warning",
                text2: `Max ${AppConstants.FORM.BUG_REPORT.MAX_IMAGES} images`,
                type: "info"
            })
            return
        }

        Keyboard.dismiss()
        await requestPermissions();
    
        launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,        
        }, (response: any) => {
            handleResponse(response);
            }
        );
    };
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            title: title ? title: '',
            bugType: 'Bug',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            Keyboard.dismiss()
            const device = await dbReadInfo(db, 'device')

            // BUG
            const bug_id: number | null = await spReportBug(
                form_data.title,
                form_data.bugType,
                device,
                form_data.descr.trim() === '' ? null : form_data.descr.trim(),
                photos.length > 0
            )            

            if (bug_id === null) {
                Toast.show(ToastMessages.EN.GENERIC_ERROR)
                router.back()
                return
            }
            
            // IMAGES
            if (photos.length > 0) {
                const bug_id_str = bug_id.toString()
                Toast.show({text1: "Uploading images...", type: "info"})
                await Promise.all(photos.map((
                    photo: string, 
                    index: number
                ) => uploadBugScreenshot(photo, bug_id_str, index)));
            }

            Toast.show(ToastMessages.EN.THANKS)
            router.back()
        setLoading(false)
    };

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
                <View style={{gap: AppConstants.GAP}} >
                    {/* Title */}
                    <Text style={Typography.semibold}>Title</Text>
                    {errors.title && (<Text style={AppStyle.error}>{errors.title.message}</Text>)}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={AppStyle.input}
                            autoCapitalize="sentences"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}/>
                        )}
                    />

                    {/* BugType */}
                    {errors.bugType && (<Text style={AppStyle.error}>{errors.bugType.message}</Text>)}
                    <Controller
                        name="bugType"
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <BugTypePicker value={value} onChange={onChange} />
                        )}
                    />
                    
                    {/* Description */}
                    <View style={{flexDirection: 'row', gap: AppConstants.GAP, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                        <Text style={Typography.semibold}>Description</Text>
                        <Text style={AppStyle.textOptional}>optional</Text>
                    </View>
                    {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}
                    <Controller
                        name="descr"
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={AppStyle.inputLarge}
                            multiline={true}
                            autoCapitalize="sentences"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}/>
                        )}
                    />
                    
                    {/* Buttons */}
                    {
                        isLoading ?
                        <>
                            <View style={AppStyle.formButton} >
                                <ActivityIndicator size={AppConstants.ICON.SIZE} color={Colors.backgroundColor} />
                            </View>
                            <View style={AppStyle.formButton} >
                                <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Images (optional)</Text>
                            </View>
                        </>
                        :
                        <>
                            <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                                <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Send</Text>
                            </Pressable>
                            <Pressable onPress={handlePickPhoto} style={AppStyle.formButton} >
                                <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Images (optional)</Text>
                            </Pressable>
                        </>
                    }

                    {/* Photos */}
                    {
                        photos.length > 0 &&
                        <View style={{width: '100%'}} >
                            <FlatList
                                data={photos}
                                keyExtractor={(item) => item}
                                horizontal={true}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <BugImage uri={item} setPhotos={setPhotos} />}
                            />
                        </View>
                    }
                    <Footer/>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default BugReportForm