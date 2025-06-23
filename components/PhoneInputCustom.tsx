import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import CountryPicker, {
    Country,
    CountryCode,
    isCountryCode,
} from 'react-native-country-picker-modal';
import parsePhoneNumberFromString from 'libphonenumber-js';
import * as Localization from 'expo-localization';
import { isSupportedCountry } from 'libphonenumber-js';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function PhoneInputCustom({ value, onChange }: Props) {
    const [countryCode, setCountryCode] = useState<CountryCode>('TR');
    const [callingCode, setCallingCode] = useState('90');
    const [displayNumber, setDisplayNumber] = useState('');

    useEffect(() => {
        const getDefaultCountry = () => {
            const region = Localization.region?.toUpperCase();
            if (region && isCountryCode(region)) {
                setCountryCode(region);
            } else {
                setCountryCode('TR');
            }
        };

        getDefaultCountry();
    }, []);

    // Dışarıdan gelen value’yi formatla ve göster
    useEffect(() => {
        if (value) {
            // Hem +90'lı hem 0'lı formatları yakalayalım
            let digitsOnly = value.replace(/\D/g, '');

            if (digitsOnly.startsWith(callingCode)) {
                digitsOnly = digitsOnly.slice(callingCode.length);
            } else if (digitsOnly.startsWith('0')) {
                digitsOnly = digitsOnly.slice(1);
            }

            setDisplayNumber(formatAsYouTypeLocal(digitsOnly));
        }
    }, [value]);


    const handleSelect = (country: Country) => {
        if (country.callingCode?.[0]) {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
        }
    };

    const handlePhoneChange = (text: string) => {
        let digits = text.replace(/\D/g, '');

        // Baştaki 0'ı at
        if (digits.startsWith('0')) {
            digits = digits.slice(1);
        }

        // En fazla 10 hane
        digits = digits.slice(0, 10);

        const formattedDisplay = formatAsYouTypeLocal(digits);
        setDisplayNumber(formattedDisplay);

        const backendFormat = `+${callingCode}${digits}`;
        onChange(backendFormat);
    };

    function formatAsYouTypeLocal(input: string): string {
        const cleaned = input.replace(/\D/g, '').slice(0, 10);

        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        if (cleaned.length <= 8)
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }

    return (
        <View style={styles.container}>
            <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withEmoji
                withCallingCode
                onSelect={handleSelect}
                containerButtonStyle={styles.flagButton}
            />

            <TextInput
                style={styles.input}
                placeholder="5XX XXX XX XX"
                keyboardType="phone-pad"
                value={displayNumber}
                onChangeText={handlePhoneChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    flagButton: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
});
