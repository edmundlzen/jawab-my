import { Button, Text, Textarea } from "@mantine/core";
import moment from "moment";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useLoading } from "../../hooks";
import { QuestionComment, AnswerComment } from "@prisma/client";
import { InferQueryOutput, trpc } from "../../utils/trpc";
import { useSession } from "next-auth/react";

type QuestionOutput = InferQueryOutput<"questions.getById">;

interface CommentsSectionProps {
    comments:
        | QuestionOutput["comments"]
        | QuestionOutput["answers"][0]["comments"];
    commentsSectionType: "question" | "answer";
    propertyId: string;
}

const CommentsSection = (props: CommentsSectionProps) => {
    const [commentBoxVisible, setCommentBoxVisible] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const { loading, setLoading } = useLoading();
    const { data: session, status } = useSession();
    const deleteQuestionComment = trpc.useMutation(["questions.deleteComment"]);
    const deleteAnswerComment = trpc.useMutation(["answers.deleteComment"]);
    const createQuestionComment = trpc.useMutation(["questions.createComment"]);
    const createAnswerComment = trpc.useMutation(["answers.createComment"]);
    const utils = trpc.useContext();
    const modals = useModals();
    const router = useRouter();

    const handleCommentDelete = async (commentId: string) => {
        if (status !== "authenticated") {
            showNotification({
                title: "Please log in",
                message: "You must be logged in to comment",
            });
            return;
        }
        modals.openConfirmModal({
            title: "Delete your comment?",
            children: (
                <Text size="sm">
                    Are you sure you want to delete your comment?
                </Text>
            ),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            confirmProps: {
                className: "bg-red-500",
                color: "red",
            },
            onCancel: () => {},
            onConfirm: async () => {
                setLoading(true);
                try {
                    if (props.commentsSectionType === "question") {
                        await deleteQuestionComment.mutateAsync({
                            commentId,
                        });
                    } else {
                        await deleteAnswerComment.mutateAsync({
                            commentId,
                        });
                    }
                    showNotification({
                        title: "Comment deleted",
                        message: "Your comment has been deleted",
                    });
                    utils.invalidateQueries(["questions.getById"]);
                    setLoading(false);
                    return;
                } catch (e) {
                    showNotification({
                        title: "Error",
                        message: "Something went wrong",
                    });
                    setLoading(false);
                    return;
                }
            },
        });
    };

    const handleCommentSubmit = async () => {
        if (status !== "authenticated") {
            showNotification({
                title: "Please log in",
                message: "You must be logged in to comment",
            });
            return;
        }
        setLoading(true);
        try {
            if (props.commentsSectionType === "question") {
                await createQuestionComment.mutateAsync({
                    questionId: props.propertyId,
                    content: commentContent,
                });
            } else {
                await createAnswerComment.mutateAsync({
                    answerId: props.propertyId,
                    content: commentContent,
                });
            }
            showNotification({
                title: "Comment created",
                message: "Your comment has been created",
            });
            utils.invalidateQueries(["questions.getById"]);
            setLoading(false);
            setCommentBoxVisible(false);
            setCommentContent("");
            return;
        } catch (e) {
            showNotification({
                title: "Error",
                message: "Something went wrong",
            });
            setLoading(false);
            return;
        }
    };

    return (
        <div>
            <div>
                {props.comments.map((comment, index) => {
                    return (
                        <div
                            key={index}
                            className={"border-t last:border-b p-2"}
                        >
                            <div
                                className={"flex items-center justify-between"}
                            >
                                <Text className={"text-xs"}>
                                    {comment.content} -{" "}
                                    <span className={"font-semibold"}>
                                        {comment.user.name}
                                    </span>{" "}
                                    -{" "}
                                    <span
                                        className={
                                            "text-xs font-semibold opacity-75"
                                        }
                                    >
                                        {moment(
                                            new Date(comment.createdAt)
                                        ).format("MMM Do YYYY [at] h:mm a")}
                                    </span>
                                </Text>
                                {comment.user.id === session?.userId && (
                                    <div
                                        className={
                                            "group cursor-pointer select-none"
                                        }
                                        onClick={() =>
                                            handleCommentDelete(comment.id)
                                        }
                                    >
                                        <Text
                                            className={
                                                "text-xs text-red-600 group-hover:font-semibold"
                                            }
                                        >
                                            Delete
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={"flex flex-col my-3"}>
                <Text
                    className={
                        "text-xs font-semibold cursor-pointer select-none text-blue-600"
                    }
                    onClick={() => {
                        if (status !== "authenticated") {
                            showNotification({
                                title: "Please log in",
                                message: "You must be logged in to comment",
                            });
                            return;
                        }
                        setCommentBoxVisible(!commentBoxVisible);
                    }}
                >
                    Add Comment
                </Text>
                {commentBoxVisible && (
                    <div className={"flex items-end"}>
                        <Textarea
                            placeholder="Your comment"
                            className={"mt-2 flex-1"}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <Button
                            className={"bg-blue-500 ml-3 mt-2"}
                            onClick={() => {
                                handleCommentSubmit();
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
