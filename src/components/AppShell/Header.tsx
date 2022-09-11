import { Icon } from "@iconify/react";
import { Loader } from "@mantine/core";
import { Button, Text } from "@/components/ui/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type HeaderProps = {
    onHamburgerClick: () => void;
    hideSidebarBurger?: boolean;
};

export default function Header(props: HeaderProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    return (
        <div
            className={
                "px-4 z-30 h-16 flex items-center w-full fixed inset-0 z-10 bg-gray-50 shadow-md"
            }
        >
            <div
                className={
                    "h-full flex justify-center items-center sm:hidden" +
                    (props.hideSidebarBurger === true ? " hidden" : "")
                }
                onClick={props.onHamburgerClick}
            >
                <Icon
                    icon="charm:menu-hamburger"
                    className={"text-xl flex-1"}
                />
            </div>
            <div
                className={
                    "mx-4 h-5/6 flex justify-center items-center cursor-pointer"
                }
                onClick={() => router.push("/")}
            >
                <img
                    src={"/images/logos/logo.png"}
                    className={
                        "h-full object-cover sm:hidden" +
                        (props.hideSidebarBurger === true ? " pl-4" : "")
                    }
                />
                <img
                    src={"/images/logos/logo_text_side.png"}
                    className={"h-4/6 pl-4 hidden sm:block"}
                />
            </div>
            <div
                className={
                    "w-16 h-full ml-auto flex justify-center items-center sm:hidden hidden"
                }
            >
                <Icon
                    icon="ant-design:search-outlined"
                    className={"text-2xl flex-1"}
                />
            </div>
            {(() => {
                switch (status) {
                    case "unauthenticated":
                        return (
                            <Button
                                className={"mr-5 sm:ml-auto"}
                                color={"red"}
                                onClick={() => router.push("/api/auth/signin")}
                            >
                                <Text>Login</Text>
                            </Button>
                        );
                    case "loading":
                        return (
                            <div
                                className={
                                    "h-full ml-auto mr-4 flex justify-center items-center"
                                }
                            >
                                <Loader />
                            </div>
                        );
                    case "authenticated":
                        return (
                            <div
                                className={
                                    "h-full ml-auto mr-4 flex justify-center items-center"
                                }
                            >
                                <div
                                    className="h-full flex justify-center items-center px-6 bg-white hover:bg-gray-300 transition-all cursor-pointer select-none"
                                    onClick={() =>
                                        router.push(
                                            `/users/${session!.username}`
                                        )
                                    }
                                >
                                    <img
                                        src={
                                            session!.user!.image
                                                ? session!.user!.image
                                                : ""
                                        }
                                        className={"h-4/6 object-cover rounded"}
                                    />
                                </div>
                            </div>
                        );
                    default:
                        return <div>Unknown status</div>;
                }
            })()}
        </div>
    );
}
