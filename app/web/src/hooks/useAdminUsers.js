import { useQuery } from '@tanstack/react-query';
import adminUserApi from '../api/adminUserApi';

export const useAdminUsers = () => {
    return useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const response = await adminUserApi.getUsers();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
