'use client'

import { useSearchParams } from 'next/navigation';


export function useUrlParams(): any {
    const search = useSearchParams();
    const result: Record<string, string | string[]> = {};

    for (const [key, value] of search) {
        if (Array.isArray(value)) {
            // Se o valor já é um array, mantenha-o assim
            result[key] = value;
        } else if (value !== undefined) {
            // Se o valor não é undefined, adicione-o como uma string
            result[key] = value;
        }
    }

    return result;
}
