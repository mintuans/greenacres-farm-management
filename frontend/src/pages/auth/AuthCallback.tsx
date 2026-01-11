import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import api from '@/src/services/api';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const provider = searchParams.get('provider');
            const error = searchParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                navigate(`/login?error=${error}`);
                return;
            }

            if (!token) {
                navigate('/login?error=no_token');
                return;
            }

            try {
                // Store token
                localStorage.setItem('farm_token', token);

                // Set token in API headers
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch user info
                const response = await api.get('/showcase/auth/me');

                if (response.data.success) {
                    const userData = {
                        ...response.data.data,
                        name: response.data.data.full_name
                    };
                    login(userData);

                    // Redirect to dashboard or home
                    navigate('/dashboard');
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                localStorage.removeItem('farm_token');
                navigate('/login?error=auth_failed');
            }
        };

        handleCallback();
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6]">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49] mb-4"></div>
                <p className="text-gray-600 font-medium">Đang xác thực...</p>
                <p className="text-sm text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
};

export default AuthCallback;
