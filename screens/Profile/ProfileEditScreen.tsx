import WorkerProfileForm from './WorkerProfileForm';
import EmployerProfileForm from './EmployerProfileForm';
import { useAuth } from '../../src/hooks/useAuth'; // token içinden rol ve userId çektiğimiz varsayım

export default function ProfileEditScreen() {
    const { user } = useAuth();

    if (user.role === 'Worker') {
        return <WorkerProfileForm userId={user.id} />;
    }

    if (user.role === 'Employer') {
        return <EmployerProfileForm userId={user.id} />;
    }

    return null;
}
