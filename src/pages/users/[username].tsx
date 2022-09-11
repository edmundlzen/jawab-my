import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Text } from "@/components/ui/core";
import { trpc } from "../../utils/trpc";
import { Tabs } from "@mantine/core";
import { Icon } from "@iconify/react";
import moment from "moment";
import {
    ProfileTab,
    AnswersTab,
    QuestionsTab,
    SettingsTab,
    VotedTab,
} from "../../components/ProfileTabs";
import { Status404 } from "../../components/StatusCodes";

interface ProfileProps {}

const Profile: NextPage<ProfileProps> = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const user = trpc.useQuery(
        ["users.getByUsername", { username: router.query.username as string }],
        { retry: false }
    );
    const isSelf = session?.username === router.query.username;

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
    if (!user.data) {
        return (
            <Layout>
                <Status404 customMessage="User not found" />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={"p-5"}>
                <div className={"flex"}>
                    <img
                        className="rounded-md mr-4"
                        src={user.data.image || ""}
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
                <Tabs className="mt-4" defaultValue={"profile"}>
                    <Tabs.List>
                        <Tabs.Tab
                            value="profile"
                            icon={<Icon icon="carbon:user-avatar-filled" />}
                        >
                            Profile
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="settings"
                            icon={<Icon icon="clarity:settings-solid" />}
                        >
                            Settings
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="questions"
                            icon={<Icon icon="bi:question-circle-fill" />}
                        >
                            Questions
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="answers"
                            icon={<Icon icon="ic:round-question-answer" />}
                        >
                            Answers
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="voted"
                            icon={<Icon icon="fluent:vote-24-filled" />}
                        >
                            Voted
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="profile">
                        <ProfileTab />
                    </Tabs.Panel>

                    <Tabs.Panel value="settings">
                        <SettingsTab />
                    </Tabs.Panel>

                    <Tabs.Panel value="questions">
                        <QuestionsTab questions={user.data.questions} />
                    </Tabs.Panel>

                    <Tabs.Panel value="answers">
                        <AnswersTab answers={user.data.answers} />
                    </Tabs.Panel>

                    <Tabs.Panel value="voted">
                        <VotedTab />
                    </Tabs.Panel>
                </Tabs>
            </div>
        </Layout>
    );
};

export default Profile;
