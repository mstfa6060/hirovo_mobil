import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeTabs from './HomeTabs';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import { useTranslation } from 'react-i18next';
import CustomDrawerContent from '../components/CustomDrawerContent';

export type DrawerParamList = {
    HomeTabs: undefined;
    ProfileEdit: undefined;
    CreateJob: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
    const { t } = useTranslation();

    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: false }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="HomeTabs"
                component={HomeTabs}
                options={{ title: t('ui.home') }}
            />
            <Drawer.Screen
                name="ProfileEdit"
                component={ProfileEditScreen}
                options={{ title: t('ui.editProfile') }}
            />
            <Drawer.Screen
                name="CreateJob"
                component={CreateJobScreen} // 📌 bu component dosyan olmalı
                options={{ title: t('ui.createJob') }}
            />

        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
