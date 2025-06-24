// components/LanguageSelectorDropdown.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import i18n from 'i18next';
import { supportedLanguages } from '@config/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageSelectorDropdown = () => {
    const currentLang = i18n.language;

    const changeLang = async (code: string) => {
        await i18n.changeLanguage(code);
        await AsyncStorage.setItem('user-language', code);
    };

    return (
        <View style={styles.container}>
            <Picker
                selectedValue={currentLang}
                onValueChange={changeLang}
                style={styles.picker}
                mode="dropdown"
            >
                {supportedLanguages.map(lang => (
                    <Picker.Item key={lang.code} label={lang.label} value={lang.code} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },

    picker: {
        height: 48,
        paddingHorizontal: 8,
    },

});
