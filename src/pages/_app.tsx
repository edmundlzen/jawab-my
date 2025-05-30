import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Head from "next/head";
import { PageLoadingProvider } from "../hooks/use-page-loading";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { MantineProvider, createEmotionCache } from "@mantine/core";

const emotionCache = createEmotionCache({ key: "mantine", prepend: false });

const MyApp: AppType = ({
    Component,
    pageProps: { session, ...pageProps },
}: any) => {
    return (
        <>
            <Head>
                <link rel="icon" href="/images/favicon.ico" />
            </Head>
            <SessionProvider session={session}>
                <MantineProvider
                    emotionCache={emotionCache}
                    withGlobalStyles
                    withNormalizeCSS
                >
                    <NotificationsProvider>
                        <ModalsProvider>
                            <PageLoadingProvider>
                                <Component {...pageProps} />
                            </PageLoadingProvider>
                        </ModalsProvider>
                    </NotificationsProvider>
                </MantineProvider>
            </SessionProvider>
        </>
    );
};

const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return "";
    }
    if (process.browser) return ""; // Browser should use current path
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
    config({ ctx }) {
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         */
        const url = `${getBaseUrl()}/api/trpc`;

        return {
            url,
            transformer: superjson,
            /**
             * @link https://react-query.tanstack.com/reference/QueryClient
             */
            // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
        };
    },
    /**
     * @link https://trpc.io/docs/ssr
     */
    ssr: false,
})(MyApp);
