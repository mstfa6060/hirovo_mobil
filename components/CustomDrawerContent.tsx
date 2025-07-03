import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import {
    useNavigation,
    CommonActions,
    CompositeNavigationProp,
} from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    DrawerNavigationProp,
} from '@react-navigation/drawer';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../src/hooks/useAuth';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { RootStackParamList } from '../navigation/RootNavigator';
import { OneSignal } from 'react-native-onesignal';

type NavigationProp = CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

const CustomDrawerContent = (props: any) => {
    const navigation = useNavigation<NavigationProp>();
    const { t } = useTranslation();
    const { user } = useAuth();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('refreshToken');
        OneSignal.logout();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const handleProfileEdit = () => {
        navigation.navigate('Drawer', { screen: 'ProfileEdit' });
    };
    const handleCreateJob = () => {
        navigation.navigate('Drawer', { screen: 'CreateJob' });
    };
    const handleMyJobList = () => {
        navigation.navigate('Drawer', { screen: 'MyJobList' });
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 60 }}>
            <View style={styles.profile}>
                <Image
                    source={{ uri: user?.profilePhotoUrl || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.fullName || 'Kullanıcı'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
            </View>

            <View style={styles.menu}>
                <MenuItem icon="person" label={t('ui.editProfile')} onPress={handleProfileEdit} />
                <MenuItem icon="work" label={t('ui.createJob')} onPress={handleCreateJob} />
                <MenuItem icon="work" label={t('ui.myjoblist')} onPress={handleMyJobList} />

                {/* <MenuItem icon="notifications" label={t('ui.notifications')} badge={3} onPress={() => { }} />
                <MenuItem icon="settings" label={t('ui.settings')} onPress={() => { }} /> */}
            </View>

            <View style={styles.footer}>
                <MenuItem icon="logout" label={t('ui.logout') || 'Çıkış'} isDanger onPress={handleLogout} />
            </View>
        </DrawerContentScrollView>
    );
};

const MenuItem = ({ icon, label, onPress, badge, isDanger = false }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <MaterialIcons name={icon} size={20} color={isDanger ? '#dc2626' : '#374151'} />
        <Text style={[styles.menuText, isDanger && { color: '#dc2626' }]}>
            {label || ''}
        </Text>
        {badge ? (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
            </View>
        ) : null}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    profile: { alignItems: 'center', marginBottom: 20 },
    avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
    name: { fontSize: 18, fontWeight: 'bold' },
    email: { fontSize: 12, color: '#6b7280' },
    menu: { paddingHorizontal: 16 },
    footer: { padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb' },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    menuText: { fontSize: 16, flex: 1 },
    badge: {
        backgroundColor: '#3b82f6',
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default CustomDrawerContent;
