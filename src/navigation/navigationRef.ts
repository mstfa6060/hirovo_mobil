import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
    screen: Name,
    params?: RootStackParamList[Name]
) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(screen as any, params as any);
    }
}
