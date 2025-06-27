import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
        'hirovo://',
        'https://hirovo.com',
        'https://hirovo.page.link',
        'https://mstfa6060.github.io/hirovo-link' // GitHub Pages yönlendirmesi için
    ],
    config: {
        screens: {
            Login: 'login',
            Register: 'register',
            Drawer: 'app',
            JobsDetail: {
                path: 'jobs/:id',
                parse: {
                    id: (id: string) => id
                }
            },
            ResetPassword: {
                path: 'reset-password',
                parse: {
                    token: (token: string) => token
                }
            },
        }
    }
};

export default linking;
