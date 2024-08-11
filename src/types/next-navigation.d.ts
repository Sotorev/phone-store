declare module 'next/navigation' {
    export function useRouter(): {
        push: (url: string) => void;
        replace: (url: string) => void;
        refresh: () => void;
        back: () => void;
        prefetch: (url: string) => Promise<void>;
    };
}
