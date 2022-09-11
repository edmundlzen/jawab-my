import {
    NextPage,
    NextPageContext,
    GetStaticPaths,
    GetStaticPropsContext,
    InferGetStaticPropsType,
} from "next";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { Input } from "@mantine/core";
import { Button, Text } from "@/components/ui/core";
import { Post } from "@/features/posts";
import { RichTextEditor } from "@/components/ui/core";
import { useEffect, useRef, useState } from "react";
import { showNotification } from "@mantine/notifications";
import sanitizeHtml from "sanitize-html";
import { usePageLoading } from "@/hooks";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { Editor } from "@mantine/rte";
import moment from "moment";
import superjson from "superjson";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/router/context";
import { QuestionPost } from "@/features/posts/question";
import { AnswerPost } from "@/features/posts/answer";
import { usePost } from "@/features/posts/hooks";
import { PostTypes } from "@/features/posts/types";

export async function getStaticProps(
    context: GetStaticPropsContext<{ question_id: string }>
) {
    const ssg = createSSGHelpers({
        router: appRouter,
        ctx: await createContext(),
        transformer: superjson, // optional - adds superjson serialization
    });
    const questionId = context.params?.question_id as string;

    await ssg.fetchQuery("questions.getById", {
        questionId,
    });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            questionId,
        },
        revalidate: 1,
    };
}

export async function getStaticPaths() {
    const questions = await prisma?.question.findMany({
        select: {
            id: true,
            subject: true,
            form: true,
        },
    });

    return {
        paths: questions?.map((question) => ({
            params: {
                question_id: question.id,
                subject: question.subject,
                form: question.form,
            },
        })),
        fallback: "blocking",
    };
}

const QuestionView = (
    props: InferGetStaticPropsType<typeof getStaticProps>
) => {
    const router = useRouter();
    const { questionId } = props;
    const [answerContent, setAnswerContent] = useState("");
    const { pageLoading, setPageLoading } = usePageLoading();
    const questionPost = trpc.useQuery(["questions.getById", { questionId }]);
    const createAnswer = trpc.useMutation(["answers.create"]);
    const createView = trpc.useMutation(["questions.view"]);
    const { data: session, status } = useSession();
    const utils = trpc.useContext();
    const editorRef = useRef<Editor>(null);

    useEffect(() => {
        createView.mutate({
            questionId,
        });
    }, [questionId]);

    const handleAnswerSubmitButton = async () => {
        if (
            sanitizeHtml(answerContent, {
                allowedTags: [],
                allowedAttributes: {},
            }).length === 0
        ) {
            showNotification({
                title: "Error",
                message: "Answer cannot be empty",
            });
            return;
        }
        for (const answer of questionPost.data?.answers || []) {
            if (answer.userId === session?.userId) {
                showNotification({
                    title: "Error",
                    message: "You have already answered this question",
                });
                return;
            }
        }

        try {
            setPageLoading(true);
            await createAnswer.mutateAsync({
                questionId: router.query.question_id as string,
                content: answerContent,
            });
            showNotification({
                title: "Answer submitted",
                message: "Your answer has been submitted successfully",
            });
            await utils.invalidateQueries(["questions.getById"]);
            editorRef.current?.editor?.clipboard.dangerouslyPasteHTML("");
            setPageLoading(false);
        } catch (e) {
            console.error(e);
            setPageLoading(false);
            showNotification({
                title: "Error",
                message: "An error occurred while submitting your answer",
            });
        }
    };

    if (router.isFallback) {
        return (
            <Layout>
                <div></div>
            </Layout>
        );
    }
    if (!questionPost.data) {
        return (
            <Layout>
                <div></div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div className={"p-5 w-full relative"}>
                <div>
                    <Text className={"font-semibold text-2xl sm:text-3xl"}>
                        {questionPost.data.title}
                    </Text>
                    <div
                        className={
                            "flex items-center pt-2 gap-x-3 pb-4 border-b"
                        }
                    >
                        <Text className={"text-xs"}>
                            Asked{" "}
                            <span className={"font-semibold"}>
                                {moment(questionPost.data.createdAt).fromNow()}
                            </span>
                        </Text>
                        <Text className={"text-xs"}>
                            Updated{" "}
                            <span className={"font-semibold"}>
                                {moment(questionPost.data.updatedAt).fromNow()}
                            </span>
                        </Text>
                        <Text className={"text-xs"}>
                            Viewed{" "}
                            <span className={"font-semibold"}>
                                {questionPost.data._count.views} times
                            </span>
                        </Text>
                    </div>
                    <QuestionPost question={questionPost.data} />
                </div>
                {/* end of question */}
                {questionPost.data.answers.length > 0 && (
                    <div className="text-3xl font-semibold pt-6">
                        {questionPost.data.answers.length} Answers
                    </div>
                )}
                <div>
                    <div>
                        {questionPost.data.answers &&
                            questionPost.data.answers.map((answer, index) => {
                                return (
                                    <AnswerPost answer={answer} key={index} />
                                );
                            })}
                    </div>
                    <div className="bg-gray-100 border p-4 rounded-md">
                        <Text
                            className={
                                "font-semibold text-2xl sm:text-3xl my-4"
                            }
                        >
                            Submit an answer
                        </Text>
                        <div className={"relative"}>
                            {status !== "authenticated" && (
                                <div
                                    className={
                                        "absolute inset-0 flex flex-col justify-center items-center z-20"
                                    }
                                >
                                    <Text className={"text-lg font-semibold"}>
                                        You must be logged in to submit an
                                        answer
                                    </Text>
                                    <Button
                                        className={"mt-4"}
                                        color={"red"}
                                        onClick={() =>
                                            router.push("/api/auth/signin")
                                        }
                                    >
                                        Login
                                    </Button>
                                </div>
                            )}
                            <div
                                className={
                                    status !== "authenticated" ? "blur-sm" : ""
                                }
                            >
                                <Input.Wrapper
                                    id="answer-content"
                                    required
                                    label="Answer"
                                    description="Please ensure your answer is clear and concise."
                                >
                                    <RichTextEditor
                                        id="answer-content"
                                        className={"min-h-[40vh]"}
                                        value={answerContent}
                                        onChange={setAnswerContent}
                                        editorRef={editorRef}
                                        // controls={[
                                        // ['bold', 'italic', 'underline', 'link', 'image'],
                                        // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                                        // ['unorderedList', 'orderedList'],
                                        // ['alignLeft', 'alignCenter', 'alignRight'],
                                        // ['sup', 'sub'],
                                        // ]}
                                    />
                                </Input.Wrapper>
                                <Button
                                    className={"mt-5"}
                                    onClick={() => {
                                        handleAnswerSubmitButton();
                                    }}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default QuestionView;
