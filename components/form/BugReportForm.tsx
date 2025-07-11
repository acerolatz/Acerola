import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { spReportBug, supabase } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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
    Text,
    TextInput,
    View
} from 'react-native';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import * as mime from 'react-native-mime-types';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';



type BugType = "ImagesOutOfOrder" | "MissingImages" | "Broken" | "Other" | "Sugestion"


const BUT_TYPE_LIST: BugType[] = [
    "Other",
    "Broken",
    "ImagesOutOfOrder",
    "MissingImages",
    "Sugestion"
]


const schema = yup.object().shape({  
    title: yup
        .string()
        .min(AppConstants.BUG_REPORT_TITLE_MIN_LENGTH, `Min ${AppConstants.BUG_REPORT_TITLE_MIN_LENGTH} characters`)
        .max(AppConstants.BUG_REPORT_TITLE_MAX_LENGTH, `Max ${AppConstants.BUG_REPORT_TITLE_MAX_LENGTH} characters`)
        .required('Title is required'),
    descr: yup
        .string()
        .max(AppConstants.BUG_REPORT_DESCR_MAX_LENGTH, `Max ${AppConstants.BUG_REPORT_DESCR_MAX_LENGTH} characters`),
    bugType: yup
        .string()
        .max(AppConstants.BUG_REPORT_BUG_TYPE_MAX_LENGTH, `Max ${AppConstants.BUG_REPORT_BUG_TYPE_MAX_LENGTH} characters`)
});


interface FormData {
    title: string
    descr: string
    bugType: BugType
}


const BugItem = ({item, isSelected, onChange}: {item: BugType, isSelected: boolean, onChange: (b: BugType) => any}) => {
    
    const onPress = () => {
        onChange(item)
    }    

    return (
        <Pressable 
        onPress={onPress}
        style={{
            height: 42, 
            alignItems: "center", 
            justifyContent: "center", 
            paddingHorizontal: 12, 
            borderRadius: 4,
            marginRight: 10,
            backgroundColor: isSelected ? Colors.BugReportColor : Colors.gray }} >
            <Text style={AppStyle.textRegular} >{item}</Text>
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
                renderItem={({item}) => <BugItem isSelected={value === item} item={item} onChange={onChange} />}
            />
        </View>
    )
}


const BugReportForm = ({title}: {title: string | undefined | null}) => {
        
    const [isLoading, setLoading] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])
    const maxImages = 5

    const requestPermissions = async () => {
        if (Platform.OS !== 'android') return true;
        try {        
            const storageGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: "Storage Permission",
                    message: "Ononoki needs access to your photos",
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
        if (photos.length >= maxImages) {
            Toast.show({text1: "Wait", text2: `Max ${maxImages} images`})
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
            descr: '',
            bugType: 'Other'
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            Keyboard.dismiss()
            
            // Create bug
            const bug_id: number | null = await spReportBug(
                form_data.title, 
                form_data.descr.trim() === '' ? null : form_data.descr.trim(), 
                form_data.bugType
            )            

            if (bug_id === null) {
                Toast.show(ToastMessages.EN.GENERIC_ERROR)
                router.back()
                return
            }
            
            // Upload bug images
            if (photos.length > 0) {
                const bug_id_str = bug_id.toString()
                Toast.show({text1: "Uploading images...", type: "info"})
                for (let i = 0; i < photos.length; i++) {
                    await uploadToSupabase(photos[i], bug_id_str)
                }
            }            
            Toast.show(ToastMessages.EN.THANKS)
            router.back()
        setLoading(false)
    };

    const renderImage = ({item} : {item: string}) => {
        
        const onPress = () => {
            setPhotos(prev => prev.filter(i => i != item))
        }

        return (
            <View style={{marginRight: 10}} >
                <Image source={{uri: item}} style={{width: 128, height: 256, borderRadius: 4}} contentFit='cover' />
                <Pressable onPress={onPress} style={{position: "absolute", right: 6, top: 6, padding: 6, backgroundColor: Colors.gray, borderRadius: 4}} hitSlop={AppConstants.hitSlopLarge} >
                    <Ionicons name='trash-bin' size={20} color={Colors.BugReportColor} />
                </Pressable>
            </View>
        )        
    }

    return (
        <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
                
                {/* Title */}
                <Text style={AppStyle.inputHeaderText}>Title</Text>
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
                {errors.title && (<Text style={AppStyle.error}>{errors.title.message}</Text>)}

                {/* BugType */}
                <Controller
                    name="bugType"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <BugTypeSelector  value={value} onChange={onChange} />
                    )}
                />
                {errors.bugType && (<Text style={AppStyle.error}>{errors.bugType.message}</Text>)}
                
                {/* Description */}
                <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                    <Text style={AppStyle.inputHeaderText}>Description</Text>
                    <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.neonRed}]}>optional</Text>
                </View>
                <Controller
                    name="descr"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[AppStyle.input, {height: hp(25), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                        multiline={true}
                        autoCapitalize="sentences"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
                {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            

                {/* Report Button */}
                <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.BugReportColor}]} >
                    {
                        isLoading ? 
                        <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                        <Text style={AppStyle.formButtonText} >Report</Text>
                    }
                </Pressable>

                {/* Bug Images */}
                <Pressable onPress={handlePickPhoto} style={[AppStyle.formButton, {backgroundColor: Colors.BugReportColor}]} >                
                    <Text style={AppStyle.formButtonText} >Images (optional)</Text>
                </Pressable>
        
                {
                    photos.length > 0 &&
                    <View style={{width: '100%', marginTop: 20, gap: 20}} >
                        <FlatList
                            data={photos}
                            keyExtractor={(item) => item}
                            horizontal={true}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderImage}
                        />
                    </View>
                }

                <View style={{height: 80}} />
                
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default BugReportForm
