import { useQuery } from '@tanstack/react-query';
import adminUserApi from '../api/adminUserApi';

export const useAdminUsers = (role) => {
    return useQuery({
        queryKey: ['adminUsers', role],
        queryFn: async () => {
            const response = await adminUserApi.getUsers(role);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
