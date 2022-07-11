import { Icon } from "@iconify-icon/react";
import { Badge, Button, Divider, Text } from "@mantine/core";
import { RichTextEditor } from "../RichTextEditor";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import moment from "moment";
import { Textarea } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useLoading } from "../../hooks";
import { useSession } from "next-auth/react";
import { InferQueryOutput } from "../../utils/trpc";
import { VoteType } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import CommentsSection from "./CommentsSection";

type QuestionOutput = InferQueryOutput<"questions.getById">;

type QuestionPostProps = {
    question: QuestionOutput;
};

const QuestionPost = (props: QuestionPostProps) => {
    const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
    const { loading, setLoading } = useLoading();
    const { data: session, status } = useSession();
    const questionsVote = trpc.useMutation(["questions.vote"]);
    const deleteQuestion = trpc.useMutation(["questions.delete"]);
    const utils = trpc.useContext();
    const router = useRouter();
    const modals = useModals();

    useEffect(() => {
        if (status === "authenticated") {
            setLoading(true);
            // Check if user has voted for this question
            props.question.votes.forEach((vote) => {
                if (vote.userId === session.userId) {
                    setVoteType(vote.voteType);
                }
            });
            setLoading(false);
        }
    }, [props.question, session, status, setLoading]);

    const handleVoteButtonClick = async (voteButtonClickType: VoteType) => {
        if (status !== "authenticated") {
            showNotification({
                title: "Please log in",
                message: "You must be logged in to vote",
            });
            return;
        }
        setLoading(true);
        if (voteButtonClickType === voteType) {
            // Unvote
            setVoteType(null);
            try {
                await questionsVote.mutateAsync({
                    questionId: props.question.id,
                    voteType: VoteType.up,
                    remove: true,
                });
                utils.invalidateQueries(["questions.getById"]);
            } catch (e: any) {
                showNotification({
                    title: "Error",
                    message: e,
                });
                setVoteType(voteType);
            }
        } else {
            // Vote
            setVoteType(voteButtonClickType);
            try {
                await questionsVote.mutateAsync({
                    questionId: props.question.id,
                    voteType: voteButtonClickType,
                    remove: false,
                });
                utils.invalidateQueries(["questions.getById"]);
            } catch (e: any) {
                showNotification({
                    title: "Error",
                    message: e,
                });
                setVoteType(voteType);
            }
            setLoading(false);
        }
    };

    const handleDeletePostButtonClick = () => {
        modals.openConfirmModal({
            title: "Delete your question?",
            children: (
                <Text size="sm">
                    Are you sure you want to delete your question?
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
                    await deleteQuestion.mutateAsync({
                        questionId: props.question.id,
                    });
                    showNotification({
                        title: "Question deleted",
                        message: "Your question has been deleted",
                    });
                    utils.invalidateQueries(["questions.getById"]);
                    router.back();
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

    return (
        <div className={""}>
            <div className={"flex"}>
                <div className={"pt-3 flex flex-col w-auto pr-3 items-center"}>
                    <div
                        className={"flex justify-center items-center group"}
                        onClick={() => handleVoteButtonClick(VoteType.up)}
                    >
                        <Icon
                            icon={"bi:arrow-up-circle-fill"}
                            className={
                                "text-3xl group-hover:text-red-800 transition-all duration-75" +
                                (voteType === "up" ? " text-red-600" : "")
                            }
                        />
                    </div>
                    <div className={"flex justify-center items-center my-4"}>
                        <Text className={"text-xl"}>
                            {props.question.votesCount}
                        </Text>
                    </div>
                    <div
                        className={"flex justify-center items-center group"}
                        onClick={() => handleVoteButtonClick(VoteType.down)}
                    >
                        <Icon
                            icon={"bi:arrow-down-circle-fill"}
                            className={
                                "text-3xl group-hover:text-red-800 transition-all duration-75" +
                                (voteType === "down" ? " text-red-600" : "")
                            }
                        />
                    </div>
                </div>
                <div className={"flex-1"}>
                    <RichTextEditor
                        readOnly
                        value={props.question.content}
                        onChange={() => {}}
                        styles={{
                            root: {
                                border: "none",
                            },
                        }}
                    />
                    <div
                        className={"pl-4 flex gap-x-2 gap-y-1 flex-1 flex-wrap"}
                    >
                        <Badge color="gray">
                            {props.question.subject.replace("_", " ")}
                        </Badge>
                        <Badge color="gray">Form {props.question.form}</Badge>
                        {props.question.tags.length !== 0
                            ? props.question.tags.map((tag, index) => {
                                  return (
                                      <Badge key={index} color={""}>
                                          {tag.name}
                                      </Badge>
                                  );
                              })
                            : null}
                    </div>
                    <div className={"flex mt-8 justify-end"}>
                        <div className={"bg-slate-200 p-3 rounded"}>
                            <img
                                className={"rounded-md h-8 w-8 mb-2"}
                                src={props.question.user.image as string}
                                referrerPolicy={"no-referrer"}
                                alt={"avatar"}
                            />
                            <Text className={"text-xs"}>
                                Asked by{" "}
                                <span className={"font-semibold"}>
                                    {props.question.user.name}
                                </span>
                            </Text>
                            <div className={"flex mt-2"}>
                                {props.question.user.id === session?.userId && (
                                    <div
                                        className={
                                            "cursor-pointer select-none group"
                                        }
                                        onClick={() =>
                                            handleDeletePostButtonClick()
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
                    </div>
                </div>
            </div>
            {/*	Comments */}
            <div>
                <div className={"flex items-center mb-2"}>
                    <Text className={"text-lg font-semibold"}>Comments</Text>
                </div>
                <CommentsSection
                    comments={props.question.comments}
                    commentsSectionType="question"
                    propertyId={props.question.id}
                />
            </div>
        </div>
    );
};

export default QuestionPost;
