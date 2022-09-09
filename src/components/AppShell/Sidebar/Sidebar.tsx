import { Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import SidebarItem from "./SidebarItem";
import { subjects } from "../../../constants";
import { trpc } from "../../../utils/trpc";

type SidebarProps = {
    navbarOpen: boolean;
};

export default function Sidebar(props: SidebarProps) {
    const router = useRouter();
    const subjectQuestionsCount = trpc.useQuery([
        "questions.getAllCountBySubject",
    ]);

    return (
        <div
            className={
                "z-10 sm:z-0 bg-white border-r pt-6 flex flex-col fixed left-0 top-16 sm:block sm:sticky sm:top-16 w-40 h-screen shrink-0" +
                (!props.navbarOpen ? " hidden" : "")
            }
        >
            <SidebarItem
                pathName={"/"}
                text={"Home"}
                icon={"ant-design:home-outlined"}
            />
            <Text className={"text-gray-500 text-sm pt-2 pb-1 pl-4"}>
                Subjects
            </Text>
            {Object.keys(subjects).map((subject, index) => (
                <SidebarItem
                    key={index}
                    pathName={"/questions/" + subject}
                    text={subjects[subject] as string}
                    // count={
                    //     subjectQuestionsCount.data &&
                    //     subjectQuestionsCount.data[subject]
                    // }
                />
            ))}
        </div>
    );
}
