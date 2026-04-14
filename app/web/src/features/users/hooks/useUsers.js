import { useQuery } from '@tanstack/react-query';
import userService from '@/features/users/services/userService';

export const useUsers = (role) => {
    return useQuery({
        queryKey: ['adminUsers', role],
        queryFn: async () => {
            const response = await userService.getUsers(role);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
