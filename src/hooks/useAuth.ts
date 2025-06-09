import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type User = {
    id: string;
    role: 'Worker' | 'Employer';
    fullName: string;
    email: string;
    avatar: string;
};

export const useAuth = () => {
    const [user, setUser] = useState<User>({
        id: '',
        role: 'Worker',
        fullName: 'Mock User',
        email: 'mock@hirovo.com',
        avatar: 'https://via.placeholder.com/150',
    });

    useEffect(() => {
        const getUserFromJwt = async () => {
            const token = await AsyncStorage.getItem('jwt');
            if (!token) return;

            const decoded: any = jwtDecode(token);

            const userId = decoded?.nameid;
            const userType = decoded?.userType;
            const fullName = decoded?.unique_name || 'Mock User';
            const email = decoded?.email || 'mock@hirovo.com'; // JWT'de email yoksa sabit
            const avatar = decoded?.avatar || 'https://media.licdn.com/dms/image/v2/D4D03AQFwdYXpsFHFrA/profile-displayphoto-shrink_200_200/B4DZSFbBJ0HkAc-/0/1737405240615?e=2147483647&v=beta&t=HbxySPJ0VxGDCNjaGheiwm-GgfiXFuLjeb042YwqsmM'; // JWT'de avatar yoksa sabit

            let role: 'Worker' | 'Employer' = 'Worker';
            if (userType === '2' || userType === 2) role = 'Employer';

            setUser({
                id: userId,
                role,
                fullName,
                email,
                avatar,
            });
        };

        getUserFromJwt();
    }, []);

    return { user };
};
