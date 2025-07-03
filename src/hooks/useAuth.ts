import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type User = {
    id: string;
    role: 'Worker' | 'Employer';
    fullName: string;
    email: string;
    bucketId: string;
};

export const useAuth = () => {
    const [user, setUser] = useState<User>({
        id: '',
        role: 'Worker',
        fullName: 'Mock User',
        email: 'mock@hirovo.com',
        bucketId: 'https://via.placeholder.com/150',
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
            const bucketId = decoded?.bucketId || 'https://media.sciencephoto.com/image/c0509276/800wm/C0509276-Perseverance_rover_on_Mars_surface,_illustration.jpg'; // JWT'de avatar yoksa sabit

            let role: 'Worker' | 'Employer' = 'Worker';
            if (userType === '2' || userType === 2) role = 'Employer';

            setUser({
                id: userId,
                role,
                fullName,
                email,
                bucketId,
            });
        };

        getUserFromJwt();
    }, []);

    return { user };
};
