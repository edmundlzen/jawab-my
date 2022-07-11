import { NextPage, NextPageContext } from "next";
import { Layout } from "../../../../components/Layout";
import { useRouter } from "next/router";
import { Button, InputWrapper, Text } from "@mantine/core";
import { Divider } from "@mantine/core";
import { QuestionPost, AnswerPost } from "../../../../components/Questions";
import { RichTextEditor } from "../../../../components/RichTextEditor";
import { useRef, useState } from "react";
import { showNotification } from "@mantine/notifications";
import sanitizeHtml from "sanitize-html";
import { useLoading } from "../../../../hooks";
import { InferQueryOutput, trpc } from "../../../../utils/trpc";
import { useSession } from "next-auth/react";
import { Editor } from "@mantine/rte";
import moment from "moment";

// type QuestionsOutput = InferQueryOutput<"questions.getAll">;

type QuestionViewProps = {
    // question: QuestionsOutput[0];
};

const QuestionView: NextPage<QuestionViewProps> = (props) => {
    const router = useRouter();
    const [answerContent, setAnswerContent] = useState("");
    const { loading, setLoading } = useLoading();
    const questionPost = trpc.useQuery([
        "questions.getById",
        { questionId: router.query.question_id as string },
    ]);
    const createAnswer = trpc.useMutation(["answers.create"]);
    const { data: session, status } = useSession();
    const utils = trpc.useContext();
    const editorRef = useRef<Editor>(null);

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
            setLoading(true);
            await createAnswer.mutateAsync({
                questionId: router.query.question_id as string,
                content: answerContent,
            });
            showNotification({
                title: "Answer submitted",
                message: "Your answer has been submitted successfully",
            });
            utils.invalidateQueries(["questions.getById"]);
            editorRef.current?.editor?.clipboard.dangerouslyPasteHTML("");
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
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
                            <span className={"font-semibold"}>N/A times</span>
                        </Text>
                    </div>
                    <QuestionPost question={questionPost.data} />
                </div>
                {/* end of question */}
                <Divider className={"my-5"} />
                <div>
                    <div>
                        {questionPost.data.answers &&
                            questionPost.data.answers.map((answer, index) => {
                                return (
                                    <AnswerPost answer={answer} key={index} />
                                );
                            })}
                    </div>
                    <Text className={"font-semibold text-2xl sm:text-3xl my-4"}>
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
                                    You must be logged in to submit an answer
                                </Text>
                                <Button
                                    className={"bg-red-400 mt-4"}
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
                            <InputWrapper
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
                            </InputWrapper>
                            <Button
                                className={"mt-5 bg-blue-500"}
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
        </Layout>
    );
};

export default QuestionView;
