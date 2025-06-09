import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';

type FormData = z.infer<typeof schema>;

const schema = z.object({
    phoneNumber: z.string().min(10, 'formErrors.phoneInvalid').optional(),
    city: z.string().min(1, 'formErrors.required').optional(),
    district: z.string().min(1, 'formErrors.required').optional(),
});

type Props = {
    userId: string;
};

const EmployerProfileForm = ({ userId }: Props) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await HirovoAPI.Employers.Detail.Request({ userId });
                reset({
                    phoneNumber: response.phoneNumber,
                    city: response.city,
                    district: response.district,
                });
            } catch (error: any) {
                Alert.alert(t('error.TITLE'), error.message || t('error.DEFAULT_ERROR'));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await HirovoAPI.Employers.UpdateProfile.Request({
                userId,
                phoneNumber: data.phoneNumber || '',
                city: data.city || '',
                district: data.district || '',
            });
            Alert.alert(t('form.success'));
        } catch (error: any) {
            Alert.alert(t('error.TITLE'), error.message || t('error.DEFAULT_ERROR'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('form.phoneNumber')}</Text>
            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />
            {errors.phoneNumber && <Text style={styles.error}>{t(errors.phoneNumber?.message || '')}</Text>}

            <Text style={styles.label}>{t('form.city')}</Text>
            <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />
            {errors.city && <Text style={styles.error}>{t(errors.city?.message || '')}</Text>}

            <Text style={styles.label}>{t('form.district')}</Text>
            <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                )}
            />
            {errors.district && <Text style={styles.error}>{t(errors.district?.message || '')}</Text>}

            <Button title={t('form.submit')} onPress={handleSubmit(onSubmit)} disabled={loading} />
        </View>
    );
};

export default EmployerProfileForm;

const styles = StyleSheet.create({
    container: { padding: 16 },
    label: { fontWeight: 'bold', marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 12,
        borderRadius: 4,
    },
    error: { color: 'red', marginBottom: 8 },
});
