import type { GetStaticPropsContext, NextPage } from "next";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";
import { PostsView } from "../components/PostsView";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "../server/router";
import superjson from "superjson";
import { createContext } from "../server/router/context";
import { Text } from "@/components/ui/core";
import { AskQuestionButton } from "@/features/posts/question";

export async function getStaticProps(context: GetStaticPropsContext<{}>) {
    const ssg = await createSSGHelpers({
        router: appRouter,
        ctx: await createContext(),
        transformer: superjson, // optional - adds superjson serialization
    });

    await ssg.fetchQuery("questions.getAll");

    return {
        props: {
            trpcState: ssg.dehydrate(),
        },
        revalidate: 1,
    };
}

const Home: NextPage = () => {
    const questions = trpc.useQuery(["questions.getAll"]);

    return (
        <Layout>
            <div className={"h-full flex flex-col"}>
                <div className={"flex justify-between py-5 border-b"}>
                    <Text
                        className={
                            "pl-6 text-xl sm:text-3xl font-semibold capitalize"
                        }
                    >
                        Questions
                    </Text>
                    <AskQuestionButton />
                </div>
                {questions.data && questions.data.length > 0 ? (
                    <PostsView questions={questions.data} />
                ) : (
                    <div
                        className={
                            "h-full flex flex-col justify-center items-center"
                        }
                    >
                        <Text
                            className={"text-3xl font-semibold text-blue-600"}
                        >
                            No questions found
                        </Text>
                        <Text className={"mt-2 text-lg text-gray-600"}>
                            There are no questions yet.
                        </Text>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;
