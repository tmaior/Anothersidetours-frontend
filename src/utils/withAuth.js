import {useEffect} from 'react';
import {useRouter} from 'next/router';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const user = localStorage.getItem('user');
            if (!user) {
                router.push('/login');
            }
        }, []);
        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
