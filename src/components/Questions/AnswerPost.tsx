import { Icon } from "@iconify-icon/react";
import { Badge, Divider, Text } from "@mantine/core";
import { RichTextEditor } from "../RichTextEditor";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useModals } from "@mantine/modals";
import { useLoading } from "../../hooks";
import { InferQueryOutput } from "../../utils/trpc";
import { useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import { VoteType } from "@prisma/client";
import CommentsSection from "./CommentsSection";

type QuestionsGetByIdOutput = InferQueryOutput<"questions.getById">;

interface AnswerProps {
    answer: QuestionsGetByIdOutput["answers"][0];
}

const AnswerPost = (props: AnswerProps) => {
    const [voteType, setVoteType] = useState<VoteType | null>(null);
    const { loading, setLoading } = useLoading();
    const { data: session, status } = useSession();
    const answersVote = trpc.useMutation(["answers.vote"]);
    const answersDelete = trpc.useMutation(["answers.delete"]);
    const utils = trpc.useContext();
    const modals = useModals();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            setLoading(true);
            // Check if user has voted for this question
            props.answer.votes.forEach((vote) => {
                if (vote.userId === session.userId) {
                    setVoteType(vote.voteType);
                }
            });
            setLoading(false);
        }
    }, [props.answer, session, status, setLoading]);

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
            await answersVote.mutateAsync({
                answerId: props.answer.id,
                voteType: VoteType.up,
                remove: true,
            });
        } else {
            // Vote
            setVoteType(voteButtonClickType);
            await answersVote.mutateAsync({
                answerId: props.answer.id,
                voteType: voteButtonClickType,
                remove: false,
            });
        }
        utils.invalidateQueries(["questions.getById"]);
        setLoading(false);
    };

    const handleDeleteAnswerButtonClick = () => {
        modals.openConfirmModal({
            title: "Delete your answer?",
            children: (
                <Text size="sm">
                    Are you sure you want to delete your answer?
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
                    if (!session) return;
                    await answersDelete.mutateAsync({
                        answerId: props.answer.id,
                    });
                    showNotification({
                        title: "Answer deleted",
                        message: "Your answer has been deleted",
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

    return (
        <div>
            <div className={"flex"}>
                <div
                    className={
                        "pt-3 flex flex-col w-auto pr-3 items-center flex-grow-0"
                    }
                >
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
                            {props.answer.votesCount}
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
                        value={props.answer.content}
                        onChange={() => {}}
                        styles={{
                            root: {
                                border: "none",
                            },
                        }}
                    />
                    <div className={"flex mt-8 justify-end"}>
                        <div className={"bg-slate-200 p-3 rounded"}>
                            <img
                                className={"rounded-md h-8 w-8 mb-2"}
                                src={props.answer.user.image as string}
                                referrerPolicy={"no-referrer"}
                                alt={"avatar"}
                            />
                            <Text className={"text-xs"}>
                                Answered by{" "}
                                <span className={"font-semibold"}>
                                    {props.answer.user.name}
                                </span>
                            </Text>
                            <div className={"flex mt-2"}>
                                {props.answer.user.id === session?.userId && (
                                    <div
                                        className={
                                            "cursor-pointer select-none group"
                                        }
                                        onClick={() =>
                                            handleDeleteAnswerButtonClick()
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
                    comments={props.answer.comments}
                    propertyId={props.answer.id}
                    commentsSectionType="answer"
                />
            </div>
            <Divider className={"mt-8"} />
        </div>
    );
};

export default AnswerPost;
