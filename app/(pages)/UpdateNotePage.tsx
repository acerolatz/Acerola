import { 
    Keyboard, 
    KeyboardAvoidingView, 
    StyleSheet, 
    Text, 
    TextInput, 
    View 
} from 'react-native'
import ReturnButton from '../components/buttons/ReturnButton'
import { router, useLocalSearchParams } from 'expo-router'
import { dbReadNote, dbUpdateNote } from '@/lib/database'
import { formatTimestampWithHour1 } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import React, { useEffect, useState } from 'react'
import Button from '../components/buttons/Button'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { SafeAreaView } from 'react-native'
import TopBar from '../components/TopBar'
import Row from '../components/util/Row'
import * as yup from 'yup'


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


const UpdateNotePage = () => {

    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const note_id = params.note_id as any
    const date = formatTimestampWithHour1(new Date().toString())

    useEffect(
        () => {
            const init = async () => {
                const n = await dbReadNote(db, note_id)
                if (n) {
                    resetForm({title: n.title, content: n.content})
                }
            }   
            init()
        },
        []
    )

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset: resetForm
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            title: '',
            content: ''
        },
    });

    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        await dbUpdateNote(
            db,
            note_id,
            form_data.title,
            form_data.content
        )
        Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
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
            <KeyboardAvoidingView style={AppStyle.flex} behavior={AppConstants.APP.KEYBOARD_VIEW_BEHAVIOR as any} >
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
                            textAlignVertical='top'
                            placeholder='Start typing...'
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

export default UpdateNotePage

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
        ...Typography.regular,
        flex: 1,
        paddingBottom: 20
    }
})