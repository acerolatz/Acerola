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
import { dbCountRows, dbDeleteAllDownloads, dbSetCacheMaxSize } from '@/lib/database'
import { clearCache, formatBytes, getDirectorySizeBytes, wp } from '@/helpers/util'
import CustomActivityIndicator from '../util/CustomActivityIndicator';
import { AppConstants } from '@/constants/AppConstants'
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from 'react-native-toast-message'
import RNRestart from 'react-native-restart';
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import Footer from '../util/Footer'
import Row from '../util/Row';
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

const CacheForm = ({
    currentCacheSize,
    currentMaxCacheSize    
}: CacheFormProps) => {

    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)
    const [storageLoading, setStorageLoading] = useState(false)
    const [storageSize, setStorageSize] = useState<string | null>(null)
    const [downloadedChapters, setDownloadedChapters] = useState(0)

    useEffect(
        () => {
            const init = async() => {
                setDownloadedChapters(await dbCountRows(db, 'downloads'))
            }
            init()
        },
        []
    )

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

    const calculateStorage = async () => {
        setStorageLoading(true)
        const s = await getDirectorySizeBytes(AppConstants.APP.MANHWAS_DIR)
        setStorageSize(formatBytes(s))
        setStorageLoading(false)
    }

    const deleteStorageData = async () => {
        setStorageLoading(true)
        await dbDeleteAllDownloads(db)
        setStorageLoading(false)
        setDownloadedChapters(await dbCountRows(db, 'downloads'))
    }

    return (
        <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
            <View style={styles.container} >
                {/* Clear Cache */}
                <Text style={Typography.semibold}>Cache Size: {formatBytes(currentCacheSize)}</Text>
                <Text style={AppStyle.error}>* Restart Required</Text>                    
                <Pressable onPress={clearAppCache} style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Clear Cache</Text>
                </Pressable>
            
                {/* Cache Size */}
                <Text style={Typography.semibold}>Max Cache Size (MB)</Text>
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
                        <Text style={Typography.regularBlack} >Save</Text>
                    </Pressable>
                }

                {/* Storage */}
                <Text style={Typography.semibold}>Storage{storageSize !== null ? ': ' + storageSize : ''}</Text>
                <Text style={Typography.regular} >chapters: {downloadedChapters}</Text>
                <Row style={AppStyle.margin} >
                    {
                        storageLoading ?
                        <View style={{width: '100%', height: AppConstants.UI.BUTTON.SIZE}} >
                            <CustomActivityIndicator/>
                        </View>
                        :
                        <>
                            <Pressable onPress={calculateStorage} style={AppStyle.button} >
                                <Text style={Typography.regularBlack} >Calculate</Text>
                            </Pressable>                
                            <Pressable onPress={deleteStorageData} style={AppStyle.button} >
                                <Text style={Typography.regularBlack} >Delete</Text>
                            </Pressable>
                        </>
                    }
                </Row>    
                
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