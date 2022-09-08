import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout } from "../../../components/Layout";
import { Text } from "@mantine/core";
import { trpc } from "../../../utils/trpc";
import { Tabs } from "@mantine/core";
import { Icon } from "@iconify/react";
import moment from "moment";
import {
    ProfileTab,
    AnswersTab,
    QuestionsTab,
    SettingsTab,
    VotedTab,
} from "../../../components/ProfileTabs";

interface ProfileProps {}

const Profile: NextPage<ProfileProps> = (props) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const user = trpc.useQuery(["users.getMe"]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [status, router]);

    useEffect(() => {
        if (user.data) {
            console.log(user.data);
        }
    }, [user.data]);

    if (status === "loading" || user.isLoading) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }
    if (status === "unauthenticated" || !user.data) {
        return (
            <Layout>
                <div>Unauthenticated</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={"p-5"}>
                <div className={"flex"}>
                    <img
                        className="rounded-md mr-4"
                        src={session!.user!.image ? session!.user!.image : ""}
                    />
                    <div>
                        <Text className={"text-3xl font-medium"}>
                            {user.data.name}
                        </Text>
                        <Text className={"text-md"}>
                            Member for{" "}
                            {moment(user.data.createdAt).fromNow(true)}
                        </Text>
                    </div>
                </div>
                <Tabs className="mt-4" styles={{ body: { paddingTop: 0 } }}>
                    <Tabs.Tab
                        label="Profile"
                        icon={<Icon icon="carbon:user-avatar-filled" />}
                    >
                        <ProfileTab />
                    </Tabs.Tab>
                    <Tabs.Tab
                        label="Settings"
                        icon={<Icon icon="clarity:settings-solid" />}
                    >
                        <SettingsTab />
                    </Tabs.Tab>
                    <Tabs.Tab
                        label="Questions"
                        icon={<Icon icon="bi:question-circle-fill" />}
                    >
                        <QuestionsTab questions={user.data.questions} />
                    </Tabs.Tab>
                    <Tabs.Tab
                        label="Answers"
                        icon={<Icon icon="ic:round-question-answer" />}
                    >
                        <AnswersTab answers={user.data.answers} />
                    </Tabs.Tab>
                    <Tabs.Tab
                        label="Voted"
                        icon={<Icon icon="fluent:vote-24-filled" />}
                    >
                        <VotedTab />
                    </Tabs.Tab>
                </Tabs>
            </div>
        </Layout>
    );
};

export default Profile;
