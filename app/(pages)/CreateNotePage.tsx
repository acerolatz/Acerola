import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '../components/TopBar'
import ReturnButton from '../components/buttons/ReturnButton'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { AppConstants } from '@/constants/AppConstants'
import Toast from 'react-native-toast-message'
import { dbInsertNote } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { ToastMessages } from '@/constants/Messages'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { formatTimestampWithHour1 } from '@/helpers/util'
import Row from '../components/util/Row'
import Button from '../components/buttons/Button'
import { router } from 'expo-router'

interface FormData {
    title: string
    content: string
}


const schema = yup.object().shape({  
    title: yup
        .string()
        .min(AppConstants.VALIDATION.NOTE.TITLE_MIN_LENGTH, `Min ${AppConstants.VALIDATION.NOTE.TITLE_MIN_LENGTH} characters`)
        .max(AppConstants.VALIDATION.NOTE.TITLE_MAX_LENGTH, `Max ${AppConstants.VALIDATION.NOTE.TITLE_MAX_LENGTH} characters`),
    content: yup
        .string()
        .min(AppConstants.VALIDATION.NOTE.CONTENT_MIN_LENGTH, `Min ${AppConstants.VALIDATION.NOTE.CONTENT_MIN_LENGTH} characters`)
});


const CreateNotePage = () => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false) 
    const date = formatTimestampWithHour1(new Date().toString())

    const {
        control,
        handleSubmit,
        formState: { errors }        
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            title: '',
            content: ''
        },
    });

    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()        
        setLoading(true)
        await dbInsertNote(db, form_data.title.trim(), form_data.content.trim())
        Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
        setLoading(false)
        router.back()
    };

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={date}>
                <Row style={{gap: AppConstants.UI.GAP * 2}} >
                    <Button onPress={handleSubmit(onSubmit)} iconName='checkmark-outline' iconColor={Colors.primary} />
                    <ReturnButton/>
                </Row>
            </TopBar>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <View style={styles.container} >
                    {errors.title && (<Text style={AppStyle.error}>{errors.title.message}</Text>)}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.titleIinput}                            
                            autoCapitalize='words'
                            placeholder='Title'
                            placeholderTextColor={Colors.primary}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value.toString()}/>
                        )}
                    />
                    {errors.content && (<Text style={AppStyle.error}>{errors.content.message}</Text>)}
                    <Controller
                        control={control}
                        name="content"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.contetInput}
                            autoCapitalize='sentences'
                            placeholder='Start typing'
                            placeholderTextColor={Colors.primary}
                            onBlur={onBlur}
                            multiline={true}
                            onChangeText={onChange}
                            value={value.toString()}/>
                        )}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default CreateNotePage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: AppConstants.UI.MARGIN
    },
    titleIinput: {
        ...Typography.semibold,
        borderBottomWidth: 1,
        borderColor: Colors.primary
    },
    contetInput: {
        ...Typography.regular        
    }
})