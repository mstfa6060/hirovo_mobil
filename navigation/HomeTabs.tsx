// navigation/HomeTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JobsAllScreen from '../screens/JobsAllScreen';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import WorkersScreen from '../screens/WorkersScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';


const Tab = createBottomTabNavigator();

const MenuButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ paddingLeft: 16 }}
    >
      <Ionicons name="menu" size={24} color="black" />
    </TouchableOpacity>
  );
};

const HomeTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerLeft: () => <MenuButton />,
        headerShown: true,
      }}
    >
      <Tab.Screen name="Jobs" component={JobsAllScreen} options={{ title: t('tabs.jobs') }} />
      <Tab.Screen name="Workers" component={WorkersScreen} options={{ title: t('tabs.workers') }} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ title: t('tabs.applications') }} />
    </Tab.Navigator>
  );
};

export default HomeTabs;
