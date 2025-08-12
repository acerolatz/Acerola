import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { dbReadInfo } from '@/lib/database';
import { spReportBug, supabase } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    PermissionsAndroid,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import * as mime from 'react-native-mime-types';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import Footer from '../util/Footer';



type BugType = "ImagesOutOfOrder" | "MissingImages" | "Broken" | "Other" | "Sugestion"


const BUT_TYPE_LIST: BugType[] = [
    "Other",
    "Sugestion",
    "Broken",
    "ImagesOutOfOrder",
    "MissingImages"
]


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


const BugItem = ({item, isSelected, onChange}: {item: BugType, isSelected: boolean, onChange: (b: BugType) => any}) => {
    
    const onPress = () => { onChange(item) }

    const backgroundColor = isSelected ? Colors.BugReportColor : Colors.backgroundSecondary
    const color = isSelected ? Colors.backgroundColor : Colors.white

    return (
        <Pressable 
        onPress={onPress}
        style={{
            height: 42,
            alignItems: "center", 
            justifyContent: "center", 
            paddingHorizontal: 12, 
            borderRadius: AppConstants.COMMON.BORDER_RADIUS,
            marginRight: AppConstants.COMMON.MARGIN,
            backgroundColor
        }} >
            <Text style={[AppStyle.textRegular, {color}]} >{item}</Text>
        </Pressable>
    )
}

const BugTypeSelector = ({value, onChange}: {value: BugType, onChange: (b: BugType) => any}) => {
    return (
        <View style={{width: '100%', height: 52}} >
            <FlatList
                data={BUT_TYPE_LIST}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => <BugItem isSelected={value === item} item={item} onChange={onChange} />}
            />
        </View>
    )
}


const BugReportForm = ({title}: {title: string | undefined | null}) => {
        
    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])

    const requestPermissions = async () => {
        if (Platform.OS !== 'android') return true;
        try {        
            const storageGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: "Storage Permission",
                    message: "Acerola needs access to your photos",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return storageGranted === PermissionsAndroid.RESULTS.GRANTED
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const decode = (base64: any) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const uploadToSupabase = async (uri: string, bug_id: string) => {
        try {
            const mimeType = mime.lookup(uri) || 'image/jpeg';
            const fileData = await RNFS.readFile(uri, 'base64');
            const filePath = `${bug_id}/${Date.now()}.jpg`;
            const { error } = await supabase
                .storage
                .from('bugs-screenshoots')
                .upload(filePath, decode(fileData), {
                    contentType: mimeType,
                    upsert: false
                });
            if (error) throw error;
        } catch (error: any) {
            console.error('error uploadToSupabase', error);
        }
    };

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
            bugType: 'Other',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            Keyboard.dismiss()
            const device = await dbReadInfo(db, 'device')
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
                for (let i = 0; i < photos.length; i++) {
                    await uploadToSupabase(photos[i], bug_id_str)
                }
            }            
            Toast.show(ToastMessages.EN.BUG_REPORT_THANKS)
            router.back()
        setLoading(false)
    };

    const renderImage = ({item} : {item: string}) => {
        
        const onPress = () => {
            setPhotos(prev => prev.filter(i => i != item))
        }

        return (
            <View style={{marginRight: AppConstants.COMMON.MARGIN}} >
                <Image source={{uri: item}} style={styles.image} contentFit='cover' />
                <Pressable onPress={onPress} style={styles.removeImageButton} hitSlop={AppConstants.COMMON.HIT_SLOP.LARGE} >
                    <Ionicons name='trash-outline' size={18} color={Colors.backgroundColor} />
                </Pressable>
            </View>
        )        
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
                {/* Title */}
                <Text style={AppStyle.inputHeaderText}>Title</Text>
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
                        <BugTypeSelector  value={value} onChange={onChange} />
                    )}
                />
                
                {/* Description */}
                <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                    <Text style={AppStyle.inputHeaderText}>Description</Text>
                    <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.neonRed}]}>optional</Text>
                </View>
                {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            
                <Controller
                    name="descr"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[AppStyle.input, {height: hp(20), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                        multiline={true}
                        autoCapitalize="sentences"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />

                {
                    isLoading ?
                    <View style={[styles.button, {marginBottom: 10}]} >
                        <ActivityIndicator size={32} color={Colors.backgroundColor} />
                    </View>
                    :
                    <Pressable onPress={handleSubmit(onSubmit)} style={[styles.button, {marginBottom: 10}]} >
                        <Text style={AppStyle.formButtonText} >Send</Text>
                    </Pressable>
                }

                {/* Bug Images */}
                <Pressable onPress={handlePickPhoto} style={styles.button} >
                    <Text style={AppStyle.formButtonText} >Images (optional)</Text>
                </Pressable>
                {
                    photos.length > 0 &&
                    <View style={{width: '100%', marginTop: 10}} >
                        <FlatList
                            data={photos}
                            keyExtractor={(item) => item}
                            horizontal={true}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderImage}
                        />
                    </View>
                }
                <Footer/>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default BugReportForm

const styles = StyleSheet.create({
    button: {
        flex: 1,
        height: 52,
        borderRadius: AppConstants.COMMON.BORDER_RADIUS,
        backgroundColor: Colors.BugReportColor,
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        width: 200, 
        height: 312, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    },
    removeImageButton: {
        position: "absolute", 
        left: 8, 
        top: 8, 
        padding: 6, 
        backgroundColor: Colors.BugReportColor, 
        borderRadius: AppConstants.COMMON.BORDER_RADIUS
    } 
})