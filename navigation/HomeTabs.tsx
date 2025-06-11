import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JobsAllScreen from '../screens/JobsAllScreen';
import WorkersScreen from '../screens/WorkersScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

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
      screenOptions={({ route }) => ({
        headerLeft: () => <MenuButton />,
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Jobs') {
            iconName = 'briefcase-outline'; // 💼 İşler için
          } else if (route.name === 'Workers') {
            iconName = 'people-outline'; // 👥 İşçiler
          } else if (route.name === 'Applications') {
            iconName = 'document-text-outline'; // 📄 Başvurular
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { paddingVertical: 6, height: 60 },
      })}
    >
      <Tab.Screen
        name="Jobs"
        component={JobsAllScreen}
        options={{ title: t('tabs.jobs') }}
      />
      <Tab.Screen
        name="Workers"
        component={WorkersScreen}
        options={{ title: t('tabs.workers') }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: t('tabs.applications') }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
