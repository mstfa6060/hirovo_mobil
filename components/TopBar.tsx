import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface TopBarProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onSearchPress?: () => void;
    onFilterPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
    title,
    subtitle,
    showBackButton = false,
    onSearchPress,
    onFilterPress
}) => {
    const navigation = useNavigation();

    return (
        <View>
            <View style={styles.topBar}>
                <View style={styles.leftSection}>
                    {showBackButton && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                            <MaterialIcons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.topBarTitle}>{title}</Text>
                </View>

                <View style={styles.iconContainer}>
                    {onSearchPress && (
                        <TouchableOpacity onPress={onSearchPress}>
                            <MaterialIcons name="search" size={24} color="#4b5563" />
                        </TouchableOpacity>
                    )}
                    {onFilterPress && (
                        <TouchableOpacity onPress={onFilterPress} style={{ marginLeft: 12 }}>
                            <MaterialIcons name="filter-list" size={24} color="#4b5563" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {subtitle && <Text style={styles.subHeader}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderBottomColor: '#e5e7eb',
        borderBottomWidth: 1
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    subHeader: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        marginHorizontal: 16
    }
});

export default TopBar;
