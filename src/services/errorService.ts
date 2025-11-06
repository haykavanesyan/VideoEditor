import { toast } from 'react-toastify';

export const errorService = {
    handle(error: unknown, message?: string) {
        console.error(error);
        const text =
            message ||
            (error instanceof Error ? error.message : 'Unexpected error occurred');
        toast.error(text);
    },
};