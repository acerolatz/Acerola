import { 
    ActivityIndicator, 
    Keyboard, 
    Pressable, 
    ScrollView,    
    Text, 
    TextInput, 
    View 
} from 'react-native'
import React, { useState } from 'react'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbSetDebugInfo } from '@/lib/database'
import { ToastMessages } from '@/constants/Messages'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message'
import { DebugInfo } from '@/helpers/types'
import Row from '../util/Row'


interface FormData {
    firstRun: number
    chapterMilestone: number
    shouldAskForDonation: number
}


const schema = yup.object().shape({  
    firstRun: yup
        .number()
        .integer('Must be a integer')
        .min(0, 'Min 0')
        .max(1, 'Max 1'),
    chapterMilestone: yup
        .number()
        .integer('Must be a integer')
        .min(0, 'Min 0'),
    shouldAskForDonation: yup
        .number()
        .integer('Must be a integer')
        .min(0, 'Min 0')
        .max(1, 'Max 1')
});


interface DebugFormProps {
    debugInfo: DebugInfo
    setDebugInfo: React.Dispatch<React.SetStateAction<DebugInfo | null>>
}


const DebugForm = ({debugInfo, setDebugInfo}: DebugFormProps) => {

    const db = useSQLiteContext()
    const [isLoading, setLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset: resetForm,
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            firstRun: debugInfo.first_run,
            chapterMilestone: debugInfo.current_chapter_milestone,
            shouldAskForDonation: debugInfo.should_ask_for_donation
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        setLoading(true)
            const newDebugInfo: DebugInfo = {
                ...debugInfo,
                first_run: form_data.firstRun, 
                current_chapter_milestone: form_data.chapterMilestone,
                should_ask_for_donation: form_data.shouldAskForDonation
            }
            await dbSetDebugInfo(db, newDebugInfo)
            setDebugInfo(newDebugInfo)
            Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
    };

    const reset = () => {
        Keyboard.dismiss()
        const newDebugInfo: DebugInfo = {
            ...debugInfo, 
            first_run: 1, 
            current_chapter_milestone: AppConstants.CHAPTER.GOAL_START,
            should_ask_for_donation: 1
        }
        resetForm({firstRun: 1, chapterMilestone: AppConstants.CHAPTER.GOAL_START, shouldAskForDonation: 1})
        setDebugInfo(newDebugInfo)
        Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
    }

    return (
        <View style={{flex: 1, gap: AppConstants.UI.GAP}} >

            {/* First Run */}
            <Text style={Typography.semibold}>FirstRun {debugInfo.first_run}</Text>            
            {errors.firstRun && (<Text style={AppStyle.error}>{errors.firstRun.message}</Text>)}
            <Controller
                control={control}
                name="firstRun"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    keyboardType='numeric'
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value.toString()}/>
                )}
            />

            {/* ChapterMilestone */}
            <Text style={Typography.semibold}>ChapterMilestone {debugInfo.total_reading_history}/{debugInfo.current_chapter_milestone}</Text>
            {errors.chapterMilestone && (<Text style={AppStyle.error}>{errors.chapterMilestone.message}</Text>)}
            <Controller
                control={control}
                name="chapterMilestone"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    keyboardType='numeric'
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value.toString()}/>
                )}
            />

            {/* ShouldAskForDonation */}
            <Text style={Typography.semibold}>ShouldAskForDonation {debugInfo.should_ask_for_donation}</Text>
            {errors.shouldAskForDonation && (<Text style={AppStyle.error}>{errors.shouldAskForDonation.message}</Text>)}
            <Controller
                control={control}
                name="shouldAskForDonation"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    keyboardType='numeric'
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value.toString()}/>
                )}
            />

            {/* Save Button */}
            {
                isLoading ?
                <Row style={{gap: AppConstants.UI.GAP}} >
                    <View style={AppStyle.button} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Reset</Text>
                    </View>
                    <View style={AppStyle.button} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                    </View>
                </Row>
                :
                <Row style={{gap: AppConstants.UI.GAP}} >
                    <Pressable onPress={reset} style={AppStyle.button} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Reset</Text>
                    </Pressable>
                    <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.button} >
                        <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Save</Text>
                    </Pressable>
                </Row>
            }

        </View>
    )
}


export default DebugForm