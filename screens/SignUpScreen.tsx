import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IAMAPI } from '@api/base_modules/iam';
import { AppConfig } from '@config/hirovo-config';
import { useTranslation } from 'react-i18next';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator'; // yolunu senin yapına göre güncelle
import { HirovoAPI } from '@api/business_modules/hirovo';


const schema = z.object({
    userName: z.string().min(1, 'validation.required'),
    firstName: z.string().min(1, 'validation.required'),
    surname: z.string().min(1, 'validation.required'),
    email: z.string().email('validation.email'),
    password: z.string().min(6, 'signup.passwordMin'),
    providerId: z.string(), // boş geçeceğiz ama zorunlu
    userType: z.nativeEnum(IAMAPI.Enums.UserType),
    companyId: z.string().uuid(),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            userName: 'testuser01',
            firstName: 'Test',
            surname: 'Kullanıcı',
            email: 'testuser01@example.com',
            password: 'Test1234!',
            providerId: '',
            userType: IAMAPI.Enums.UserType.Worker,
            companyId: AppConfig.DefaultCompanyId,
            description: 'Bu kullanıcı test amaçlı oluşturulmuştur.',
        }


        // defaultValues: {
        //     userName: '',
        //     firstName: '',
        //     surname: '',
        //     email: '',
        //     password: '',
        //     providerId: '', // zorunlu ama boş string geçiyoruz
        //     userType: IAMAPI.Enums.UserType.Worker,
        //     companyId: AppConfig.DefaultCompanyId,
        //     description: '',
        // }
    });

    const [userTypeOpen, setUserTypeOpen] = useState(false);
    const [userTypeItems, setUserTypeItems] = useState([
        { label: t('ui.signup.worker'), value: IAMAPI.Enums.UserType.Worker },
        { label: t('ui.signup.employer'), value: IAMAPI.Enums.UserType.Employer },
        { label: t('ui.signup.workerAndEmployer'), value: IAMAPI.Enums.UserType.WorkerAndEmployer },
    ]);

    const onSubmit = async (data: FormData) => {
        try {
            // 1. Kullanıcıyı oluştur
            const userResponse = await IAMAPI.Users.Create.Request({
                ...data,
                companyId: AppConfig.DefaultCompanyId,
                providerId: '',
                userSource: IAMAPI.Enums.UserSources.Manual,
                description: data.description ?? '',
            });

            const userId = userResponse?.id;
            const DEFAULT_ROLE_ID = 'B3F8A7D1-4E2C-4A3E-8B5A-D3E7B9C5E2F1';

            // 2. Giriş yap
            const loginResponse = await IAMAPI.Auth.Login.Request({
                provider: 'native',
                userName: data.userName,
                password: data.password,
                token: '',
                platform: IAMAPI.Enums.ClientPlatforms.Mobile,
                isCompanyHolding: false,
                companyId: AppConfig.DefaultCompanyId,
            });
            await AsyncStorage.setItem('jwt', loginResponse.jwt);
            await AsyncStorage.setItem('refreshToken', loginResponse.refreshToken);


            console.log('Kullanıcı oluşturuldu ve giriş yapıldı:', userResponse, loginResponse);
            // 3. Kullanıcıya rol ata
            if (userId) {
                const roleResult = await HirovoAPI.RelUserRoles.Create.Request({
                    userId,
                    roleIds: [DEFAULT_ROLE_ID],
                });

                if (!roleResult?.isEverythingOk) {
                    console.warn('⚠️ Rol ataması başarısız');
                }
            }


            navigation.reset({
                index: 0,
                routes: [{ name: 'Drawer', params: { screen: 'HomeTabs' } }],
            });

        } catch (error: any) {
            console.error('Kayıt olma hatası:', error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                t('ui.signup.errorMessage');
            Alert.alert(t('ui.signup.errorTitle'), errorMessage);
        }
    };



    const inputFields = [
        { name: 'userName', label: t('ui.login.usernamePlaceholder'), placeholder: t('ui.login.usernamePlaceholder') },
        { name: 'firstName', label: t('ui.signup.name'), placeholder: t('ui.signup.enterName') },
        { name: 'surname', label: t('ui.signup.surname'), placeholder: t('ui.signup.enterSurname') },
        { name: 'email', label: t('ui.signup.email'), placeholder: t('ui.signup.enterEmail'), keyboardType: 'email-address' as const },
        { name: 'password', label: t('ui.signup.password'), placeholder: t('ui.signup.enterPassword'), secureTextEntry: true },
        { name: 'providerId', label: '', placeholder: '', hidden: true }, // görünmeyecek ama gönderilecek
        { name: 'description', label: t('ui.profile.description'), placeholder: t('ui.form.descriptionPlaceholder'), multiline: true },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={styles.header}>{t('ui.signup.title')}</Text>

                {inputFields.map(({ name, label, hidden, ...rest }) => (
                    <View key={name} style={[styles.field, hidden && { display: 'none' }]}>
                        <Text style={styles.label}>{label}</Text>
                        <Controller
                            control={control}
                            name={name as keyof FormData}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    value={value?.toString() ?? ''}
                                    onChangeText={onChange}
                                    {...rest}
                                />
                            )}
                        />
                        {errors[name as keyof FormData] && (
                            <Text style={styles.error}>
                                {t(errors[name as keyof FormData]?.message?.toString() || '')}
                            </Text>
                        )}
                    </View>
                ))}

                <View style={styles.field}>
                    <Text style={styles.label}>{t('ui.signup.iAmA')}</Text>
                    <Controller
                        control={control}
                        name="userType"
                        render={({ field }) => (
                            <DropDownPicker
                                open={userTypeOpen}
                                value={field.value ?? null}
                                items={userTypeItems}
                                setOpen={setUserTypeOpen}
                                setValue={callback => {
                                    const value = typeof callback === 'function' ? callback(field.value) : callback;
                                    field.onChange(value);
                                }}
                                setItems={setUserTypeItems}
                                placeholder={t('ui.signup.iAmA')}
                                style={styles.input}
                                zIndex={2000}
                                zIndexInverse={1000}
                                listMode="MODAL"
                            />
                        )}
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? t('common.loading') : t('common.save')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#111827',
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 12,
        fontSize: 16,
    },
    error: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
