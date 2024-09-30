import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

let displayedNetworkFailureError = false;

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry(failureCount) {
                    if (failureCount >= 3) {
                        if (displayedNetworkFailureError === false) {
                            displayedNetworkFailureError = true;

                            toast.error(
                                "A aplicação está demorando mais que o esperado para carregar, tente novamente em alguns minutos.",
                                {
                                    onDismiss: () => {
                                        displayedNetworkFailureError = false;
                                    },
                                },
                            );
                        }

                        return false;
                    }

                    return true;
                },
            },
            mutations: {
                onError(error) {
                    if (isAxiosError(error)) {
                        if ("message" in error.response?.data) {
                            toast.error(error.response?.data.message);
                        } else {
                            toast.error("Erro ao processar operação!");
                        }
                    }
                },
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export const queryClient = getQueryClient();