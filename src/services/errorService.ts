import { toast } from 'react-toastify';

export const errorService = {
    handle(type: 'error' | 'warning', error: unknown, message?: string) {
        console.error(error, message)
        const text =
            message ||
            (error instanceof Error ? error.message : 'Unexpected error occurred');
        toast[type](text);
    },
};