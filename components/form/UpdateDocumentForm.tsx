import {
    Keyboard, 
    Pressable, 
    StyleSheet, 
    Text, 
    TextInput, 
    View 
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';


interface FormData {
    name: string
    descr: string
}


const schema = yup.object().shape({  
    name: yup
        .string()
        .min(2, 'Min 2 characters')
        .max(256, 'Max 256 characters'),
    descr: yup
        .string()
        .max(2048, 'Max 1024 characters')
});


interface UpdateDocumentFormProps {
    name: string
    descr: string | null
    onPress: (name: string, descr: string) => any
}


const UpdateDocumentForm = ({name, descr, onPress}: UpdateDocumentFormProps) => {
    
    const [isLoading, setLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset: resetForm,
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: name,
            descr: descr ? descr : ''
        },
    });

    useEffect(
        () => {
            const init = async () => {
                resetForm({name, descr: descr ? descr : ''})
            }
            init()
        },
        [name, descr]
    )
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        setLoading(true)
            await onPress(form_data.name, form_data.descr)
            resetForm({name: '', descr: ''})
        setLoading(false)
    };

    return (
        <View style={{flex: 1, gap: AppConstants.UI.GAP}} >

            {/* Name */}
            <Text style={Typography.semibold}>Name</Text>
            {errors.name && (<Text style={AppStyle.error}>{errors.name.message}</Text>)}
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    autoCapitalize='sentences'
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value.toString()}/>
                )}
            />

            {/* Descr */}
            <Text style={Typography.semibold}>Description</Text>
            {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}
            <Controller
                control={control}
                name="descr"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.inputMedium}
                    autoCapitalize='sentences'
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value.toString()}/>
                )}
            />

            {/* Create Button */}
            {
                isLoading ?
                <View style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Edit</Text>
                </View>
                :
                <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                    <Text style={{...Typography.regular, color: Colors.backgroundColor}} >Edit</Text>
                </Pressable>
            }

        </View>
    )
}


export default UpdateDocumentForm


const styles = StyleSheet.create({
    input: {
        ...AppStyle.input,
        backgroundColor: Colors.backgroundColor
    },
    inputMedium: {
        ...AppStyle.inputMedium,
        backgroundColor: Colors.backgroundColor
    }
})