import { 
    ActivityIndicator, 
    Keyboard, 
    Pressable, 
    ScrollView,    
    StyleSheet,    
    Text, 
    TextInput, 
    View 
} from 'react-native'
import { clearCache, formatBytes, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import { dbSetCacheMaxSize } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import RNRestart from 'react-native-restart';
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import Footer from '../util/Footer'
import * as yup from 'yup';


interface FormData {
    maxCacheSize: number
    safeModePassword: string
}


const schema = yup.object().shape({  
    maxCacheSize: yup
        .number()
        .min(AppConstants.VALIDATION.SETTINGS.MIN_CACHE_SIZE, `Min ${AppConstants.VALIDATION.SETTINGS.MIN_CACHE_SIZE} MB`)
        .max(AppConstants.VALIDATION.SETTINGS.MAX_CACHE_SIZE, `Max ${AppConstants.VALIDATION.SETTINGS.MAX_CACHE_SIZE} MB`)    
});


interface CacheFormProps {
    currentCacheSize: number
    currentMaxCacheSize: number
}

const CacheForm = ({currentCacheSize, currentMaxCacheSize}: CacheFormProps) => {

    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)

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
            form_data.maxCacheSize < AppConstants.VALIDATION.SETTINGS.MIN_CACHE_SIZE ||
            form_data.maxCacheSize > AppConstants.VALIDATION.SETTINGS.MAX_CACHE_SIZE
        ) { return }
        setLoading(true)
        await dbSetCacheMaxSize(db, form_data.maxCacheSize * 1024 * 1024)
        Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };

    const clearAppCache = async () => {
        Keyboard.dismiss()
        await clearCache()
        RNRestart.Restart();
    }

    return (
        <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
            <View style={styles.container} >
                {/* Clear Cache */}
                <Text style={Typography.semibold}>Cache size: {formatBytes(currentCacheSize)}</Text>
                <Text style={AppStyle.error}>* Restart Required</Text>                    
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
                        maxLength={AppConstants.VALIDATION.SETTINGS.MAX_CACHE_SIZE.toString().length}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />
                
                {/* Save Button */}
                {
                    isLoading ?
                    <View style={AppStyle.formButton} >
                        <ActivityIndicator size={AppConstants.UI.ICON.SIZE} color={Colors.backgroundColor} />
                    </View> 
                    :
                    <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                    </Pressable>
                }
            </View>
            <Footer/>
        </ScrollView>
    )
}


export default CacheForm

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        gap: AppConstants.UI.GAP, 
        paddingHorizontal: wp(1)
    }
})