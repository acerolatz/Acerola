import { 
    Keyboard, 
    Pressable, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    View 
} from 'react-native'
import React, { useState } from 'react'
import { useSettingsState } from '@/store/settingsState'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbSetNumericInfo } from '@/lib/database'
import { wp } from '@/helpers/util'
import { Colors } from '@/constants/Colors'
import CustomActivityIndicator from '../util/CustomActivityIndicator'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'
import Footer from '../util/Footer'
import Row from '../util/Row'


const ItemVisiblePercentThresholdDescr = `It defines the minimum percentage of an item that must be visible on the screen for it to be considered “viewable.”

Helps with:

    • Prefetching only imagens that are about to appear.
    • Lazy-loading content or unloading items from memory.
    
Recommended value: 50`



interface FormData {
    windowSize: number
    maxToRenderPerBatch: number
    updateCellsBatchingPeriod: number
    itemVisiblePercentThreshold: number
}


const schema = yup.object().shape({  
    windowSize: yup
        .number()
        .integer('Must be a integer')
        .min(3, 'Min 3')
        .max(32, 'Max 32')
        .required('WindowSize is required'),
    maxToRenderPerBatch: yup
        .number()
        .integer('Must be a integer')
        .min(1, 'Min 1')
        .max(64, 'Max 64')
        .required('MaxToRenderPerBatch is required'),
    updateCellsBatchingPeriod: yup
        .number()
        .integer('Must be a integer')
        .min(20, 'Min 20')
        .max(6000,'Max 6000')
        .required('UpdateCellsBatchingPeriod is required'),
    itemVisiblePercentThreshold: yup
        .number()
        .integer('Must be a integer')
        .min(0, 'Min 0')
        .max(100, 'Max 100')
        .required('ItemVisiblePercentThreshold is required')
});

const PerformanceUIForm = () => {

    const db = useSQLiteContext()
    const { settings, setSettings  } = useSettingsState()

    const [loading, setLoading] = useState(false)    

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset: resetForm,
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            windowSize: settings.windowSize,
            maxToRenderPerBatch: settings.maxToRenderPerBatch,
            updateCellsBatchingPeriod: settings.updateCellsBatchingPeriod,
            itemVisiblePercentThreshold: settings.itemVisiblePercentThreshold
        },
    });

    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            Keyboard.dismiss()
            setSettings({
                ...settings, 
                windowSize: form_data.windowSize, 
                maxToRenderPerBatch: form_data.maxToRenderPerBatch,
                updateCellsBatchingPeriod: form_data.updateCellsBatchingPeriod,
                itemVisiblePercentThreshold: form_data.itemVisiblePercentThreshold
            })
            await Promise.all([
                dbSetNumericInfo(db, 'windowSize', form_data.windowSize),
                dbSetNumericInfo(db, 'maxToRenderPerBatch', form_data.maxToRenderPerBatch),
                dbSetNumericInfo(db, 'updateCellsBatchingPeriod', form_data.updateCellsBatchingPeriod),
                dbSetNumericInfo(db, 'itemVisiblePercentThreshold', form_data.itemVisiblePercentThreshold)
            ])            
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };

    const reset = async () => {
        setLoading(true)
            const defaultValues = {
                windowSize: AppConstants.DEFAULT_WINDOW_SIZE,
                maxToRenderPerBatch: AppConstants.DEFAULT_MAX_TO_RENDER_PER_BATCH,
                updateCellsBatchingPeriod: AppConstants.DEFAULT_UPDATE_CELLS_BATCHING_PERIOD,
                itemVisiblePercentThreshold: AppConstants.DEFAULT_ITEM_VISIBLE_PERCENTAGE_THRESHOLD
            }
            Keyboard.dismiss()
            setSettings({ ...settings, ...defaultValues})
            await Promise.all([
                dbSetNumericInfo(db, 'windowSize', AppConstants.DEFAULT_WINDOW_SIZE),
                dbSetNumericInfo(db, 'maxToRenderPerBatch', AppConstants.DEFAULT_MAX_TO_RENDER_PER_BATCH),
                dbSetNumericInfo(db, 'updateCellsBatchingPeriod', AppConstants.DEFAULT_UPDATE_CELLS_BATCHING_PERIOD),
                dbSetNumericInfo(db, 'itemVisiblePercentThreshold', AppConstants.DEFAULT_ITEM_VISIBLE_PERCENTAGE_THRESHOLD)
            ])
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
            resetForm(defaultValues)
        setLoading(false)
    }
    
    return (        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
            <View style={{flex: 1, gap: AppConstants.GAP, paddingHorizontal: wp(1)}} >
                <Text style={{...Typography.regular, color: Colors.primary}} >
                    This section defines some attributes related to the list that displays the images of a pornhwa chapter.
                </Text>
                <Text style={{...Typography.regular, color: Colors.red}} >
                    Change only if necessary.
                </Text>
                {/* Draw Distance */}
                <Text style={Typography.semibold}>WindowSize</Text>                
                <Text style={Typography.regular}>
                    Determines the maximum number of items rendered outside of the visible area, in units of visible lengths. So if images list fills the screen, then windowSize=[{AppConstants.DEFAULT_WINDOW_SIZE}] (the default) will render the visible screen area plus up to {Math.floor(AppConstants.DEFAULT_WINDOW_SIZE / 2)} screens above and {Math.floor(AppConstants.DEFAULT_WINDOW_SIZE / 2)} below the viewport. Reducing this number will reduce memory consumption and may improve performance, but will increase the chance that fast scrolling may reveal momentary blank areas of unrendered content.
                </Text>
                {errors.windowSize && (<Text style={AppStyle.error}>{errors.windowSize.message}</Text>)}
                <Controller
                    name="windowSize"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {/* MaxToRenderPerBatch */}
                <Text style={Typography.semibold}>MaxToRenderPerBatch</Text>                
                <Text style={Typography.regular}>
                    The maximum number of items to render in each incremental render batch. The more rendered at once, the better the fill rate, but responsiveness may suffer because rendering content may interfere with responding to button taps or other interactions.
                </Text>
                {errors.maxToRenderPerBatch && (<Text style={AppStyle.error}>{errors.maxToRenderPerBatch.message}</Text>)}
                <Controller
                    name="maxToRenderPerBatch"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {/* UpdateCellsBatchingPeriod */}
                <Text style={Typography.semibold}>UpdateCellsBatchingPeriod</Text>                
                <Text style={Typography.regular}>
                    Amount of time (milliseconds) between low-pri item render batches, e.g. for rendering items quite a ways off screen. Similar fill rate/responsiveness tradeoff as maxToRenderPerBatch.
                </Text>
                {errors.updateCellsBatchingPeriod && (<Text style={AppStyle.error}>{errors.updateCellsBatchingPeriod.message}</Text>)}
                <Controller
                    name="updateCellsBatchingPeriod"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {/* ItemVisiblePercentThreshold */}
                <Text style={Typography.semibold}>ItemVisiblePercentThreshold</Text>                
                <Text style={Typography.regular}>{ItemVisiblePercentThresholdDescr}</Text>
                {errors.itemVisiblePercentThreshold && (<Text style={AppStyle.error}>{errors.itemVisiblePercentThreshold.message}</Text>)}
                <Controller
                    name="itemVisiblePercentThreshold"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        keyboardType='numeric'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value.toString()}/>
                    )}
                />

                {
                    loading ?

                    <Row style={{gap: AppConstants.GAP}} >
                        <View style={AppStyle.button} >
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Reset</Text>
                        </View>
                        <View style={AppStyle.button} >
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                        </View>
                    </Row>
                    :
                    <Row style={{gap: AppConstants.GAP}} >
                        <Pressable onPress={reset} style={AppStyle.button} >
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Reset</Text>
                        </Pressable>
                        <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.button} >
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                        </Pressable>
                    </Row>
                }


            </View>
            <Footer/>
        </ScrollView>
    )
}

export default PerformanceUIForm

const styles = StyleSheet.create({})