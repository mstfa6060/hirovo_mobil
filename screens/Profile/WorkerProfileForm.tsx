import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';

type Props = {
    userId: string;
};

const schema = z.object({
    phoneNumber: z.string().min(10),
    birthDate: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    description: z.string().optional(),
    isAvailable: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const WorkerProfileForm: React.FC<Props> = ({ userId }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: '',
            birthDate: undefined,
            city: '',
            district: '',
            description: '',
            isAvailable: false,
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await HirovoAPI.Workers.Detail.Request({ userId });
                reset({
                    phoneNumber: response.phoneNumber,
                    birthDate: response.birthDate ? new Date(response.birthDate).toISOString().split('T')[0] : undefined,
                    city: response.city,
                    district: response.district,
                    description: response.description,
                    isAvailable: response.isAvailable ?? false,
                });
            } catch (err) {
                Alert.alert(t('error.DEFAULT_ERROR'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            await HirovoAPI.Workers.UpdateProfile.Request({
                userId,
                phoneNumber: data.phoneNumber,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                city: data.city ?? '',
                district: data.district ?? '',
                description: data.description ?? '',
                isAvailable: data.isAvailable ?? false,
            });
            Alert.alert(t('ui.profile.updated'));
        } catch (err) {
            Alert.alert(t('error.DEFAULT_ERROR'));
        }
    };

    return (
        <View style={styles.container}>
            <Text>{t('ui.profile.phoneNumber')}</Text>
            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />
            {errors.phoneNumber && <Text style={styles.error}>{t('validation.phoneNumber')}</Text>}

            <Text>{t('ui.profile.birthDate')}</Text>
            <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" />
                )}
            />

            <Text>{t('ui.profile.city')}</Text>
            <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />

            <Text>{t('ui.profile.district')}</Text>
            <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />

            <Text>{t('ui.profile.description')}</Text>
            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />

            <View style={styles.switchContainer}>
                <Text>{t('ui.profile.isAvailable')}</Text>
                <Controller
                    control={control}
                    name="isAvailable"
                    render={({ field: { onChange, value } }) => (
                        <Switch value={value} onValueChange={onChange} />
                    )}
                />
            </View>

            <Button title={t('ui.common.save')} onPress={handleSubmit(onSubmit)} disabled={loading} />
        </View>
    );
};

export default WorkerProfileForm;

const styles = StyleSheet.create({
    container: { padding: 16 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
        marginBottom: 12,
    },
    error: {
        color: '#f00',
        marginBottom: 8,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});
