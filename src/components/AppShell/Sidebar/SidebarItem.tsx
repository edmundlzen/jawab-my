import { Badge, Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

type SidebarItemProps = {
    pathName: string;
    icon?: string;
    text: string;
    count?: number;
};

export default function SidebarItem(props: SidebarItemProps) {
    const router = useRouter();

    return (
        <div
            className={
                "flex pl-5 py-2 w-full select-none cursor-pointer group" +
                (router.asPath == props.pathName
                    ? " bg-gray-200"
                    : " hover:bg-gray-100")
            }
            onClick={() => router.push(props.pathName)}
        >
            {props.icon && <Icon icon={props.icon} className={"text-xl"} />}
            <Text
                className={
                    "ml-2 mr-1 text-sm" +
                    (!props.icon ? " ml-2" : "") +
                    (router.asPath == props.pathName
                        ? " font-bold"
                        : " font-semibold group-hover:font-bold")
                }
            >
                {props.text}
            </Text>
            {props.count ? (
                <div className="ml-auto mr-2 flex justify-center items-center">
                    <Badge color="grape">{props.count}</Badge>
                </div>
            ) : null}
        </div>
    );
}
