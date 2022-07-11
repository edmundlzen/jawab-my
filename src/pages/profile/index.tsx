import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Layout } from "../../components/Layout";
import { Text } from "@mantine/core";
import { trpc } from "../../utils/trpc";
import moment from "moment";

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
                            Member for {moment(user.data.createdAt).fromNow(true)}
                        </Text>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
