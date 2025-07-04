import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppConfig } from '@config/hirovo-config';
import { ApiService } from '@services/ApiService';
import { FileProviderAPI } from '@api/base_modules/FileProvider';

export const pickAndUploadProfilePhoto = async ({
    userId,
    tenantId,
    bucketId,
}: {
    userId: string;
    tenantId: string;
    bucketId: string;
}): Promise<FileProviderAPI.Files.Upload.IResponseModel | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        const file = result.assets[0];

        const manipulatedImage = await ImageManipulator.manipulateAsync(
            file.uri,
            [{ resize: { width: 512 } }],
            {
                compress: 0.8,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );

        const formData = new FormData();
        formData.append('folderName', 'ProfilePictures');
        formData.append('entityId', userId);
        formData.append('moduleName', 'hirovo');
        formData.append('versionName', 'v1');
        formData.append('tenantId', tenantId);
        formData.append('bucketType', FileProviderAPI.Enums.BucketTypes.SingleFileBucket.toString());
        formData.append('bucketId', bucketId);
        formData.append('formFile', {
            uri: manipulatedImage.uri,
            name: `profile_${Date.now()}.jpg`,
            type: 'image/jpeg',
        } as any);

        return await ApiService.callMultipart<FileProviderAPI.Files.Upload.IResponseModel>(
            FileProviderAPI.Files.Upload.RequestPath,
            formData
        );
        // console.log('📁 Profil resmi yükleme sonucu:', uploaded);
        // const uploadedFile = uploaded.files?.[0] as any;

        // return uploadedFile?.securePath || `${AppConfig.BaseApi}/file-storage/${uploadedFile?.path}`;
    } catch (err: any) {
        console.error('📁 Profil resmi yükleme hatası:', {
            status: err?.response?.status,
            data: err?.response?.data,
            url: err?.config?.url,
            headers: err?.config?.headers,
        });
        return null;
    }
};
