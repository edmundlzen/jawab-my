import { Header, Footer, Sidebar } from "./";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import { useRouter } from "next/router";
import { usePageLoading } from "../../hooks";

type AppShellProps = {
    children: React.ReactNode;
    hideSidebar: boolean;
};

export default function AppShell(props: AppShellProps) {
    const router = useRouter();
    const { children, hideSidebar } = props;
    const [navbarOpen, setNavbarOpen] = useState(false);
    const { pageLoading, setPageLoading } = usePageLoading();

    useEffect(() => {
        if (!setPageLoading) return;
        router.events.on("routeChangeStart", () => {
            setPageLoading(true);
        });
        router.events.on("routeChangeComplete", () => {
            setPageLoading(false);
        });
    }, [router, setPageLoading]);

    return (
        <div className={"flex flex-col items-center w-full"}>
            <Header
                onHamburgerClick={() => setNavbarOpen(!navbarOpen)}
                hideSidebarBurger={hideSidebar}
            />
            <div className={"flex justify-center max-w-7xl pt-16 min-h-screen"}>
                {" "}
                {/* Update top padding to match header height */}
                {!props.hideSidebar && <Sidebar navbarOpen={navbarOpen} />}
                <div
                    className={
                        "min-w-[100vw] sm:min-w-0 sm:w-[70vw] lg:w-[50vw] relative z-0"
                    }
                >
                    <LoadingOverlay visible={pageLoading} />
                    {!children && (
                        <div
                            className={
                                "flex justify-center items-center h-full"
                            }
                        >
                            <img
                                src={"/images/memes/no_children.jpg"}
                                alt={"No children? meme"}
                                className={"h-[60vh]"}
                            />
                        </div>
                    )}
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}
