import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { Layout } from "@/components/Layout";
import { trpc } from "@/utils/trpc";
import { PostsView } from "@/components/PostsView";
import { useRouter } from "next/router";
import { Subject } from "@prisma/client";
import { useEffect } from "react";
import { usePageLoading } from "../../../hooks";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/router/context";
import superjson from "superjson";
import { Text } from "@/components/ui/core";
import { AskQuestionButton } from "@/features/posts/question";

export async function getStaticProps(
    context: GetStaticPropsContext<{ subject: Subject }>
) {
    const ssg = await createSSGHelpers({
        router: appRouter,
        ctx: await createContext(),
        transformer: superjson, // optional - adds superjson serialization
    });

    await ssg.fetchQuery("questions.getBySubject", {
        subject: context.params?.subject as Subject,
    });

    return {
        props: {
            trpcState: ssg.dehydrate(),
        },
        revalidate: 1,
    };
}

export async function getStaticPaths() {
    const questions = await prisma?.question.findMany({
        select: {
            subject: true,
        },
    });

    return {
        paths: questions?.map((question) => ({
            params: {
                subject: question.subject,
            },
        })),
        fallback: "blocking",
    };
}

const SubjectView = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
    const router = useRouter();
    const questions = trpc.useQuery([
        "questions.getBySubject",
        { subject: router.query.subject as Subject },
    ]);

    return (
        <Layout>
            <div className={"h-full flex flex-col"}>
                <div className={"flex justify-between py-5 border-b"}>
                    <Text
                        className={
                            "pl-6 text-xl sm:text-3xl font-semibold capitalize"
                        }
                    >
                        {router.query.subject}
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
                            There are no questions for{" "}
                            <span className={"capitalize"}>
                                {router.query.subject as string}
                            </span>{" "}
                            yet.
                        </Text>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SubjectView;
