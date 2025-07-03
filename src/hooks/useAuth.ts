import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { FileProviderAPI } from '@api/base_modules/FileProvider';
import { AppConfig } from '@config/hirovo-config';

type User = {
    id: string;
    role: 'Worker' | 'Employer';
    fullName: string;
    email: string;
    profilePhotoUrl: string | null;
    bucketId: string;
};

export const useAuth = () => {
    const [user, setUser] = useState<User>({
        id: '',
        role: 'Worker',
        fullName: 'Mock User',
        email: 'mock@hirovo.com',
        profilePhotoUrl: null,
        bucketId: '',
    });

    useEffect(() => {
        const getUserFromJwt = async () => {
            const token = await AsyncStorage.getItem('jwt');
            if (!token) return;

            const decoded: any = jwtDecode(token);

            const userId = decoded?.nameid;
            const userType = decoded?.userType;
            const fullName = decoded?.unique_name || 'Mock User';
            const email = decoded?.email || 'mock@hirovo.com';
            const bucketId = decoded?.bucketId;

            let role: 'Worker' | 'Employer' = 'Worker';
            if (userType === '2' || userType === 2) role = 'Employer';

            let profilePhotoUrl: string | null = null;
            if (bucketId) {
                try {
                    const result = await FileProviderAPI.Buckets.Detail.Request({
                        bucketId,
                        changeId: '00000000-0000-0000-0000-000000000000',
                    });

                    const file = result.files?.[0];
                    if (file) {
                        profilePhotoUrl = file.securePath || `${AppConfig.BaseApi}/file-storage/${file.path}`;
                    }
                } catch (err) {
                    console.warn('📁 Profil fotoğrafı getirilemedi:', err);
                }
            }

            setUser({
                id: userId,
                role,
                fullName,
                email,
                profilePhotoUrl,
                bucketId,
            });
        };

        getUserFromJwt();
    }, []);

    return { user };
};
