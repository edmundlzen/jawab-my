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

interface CommonPostProps {
    hideCommentsSection?: boolean;
    hidePostedBy?: boolean;
    disableVoting?: boolean;
}

type ConditionalPostProps =
    | {
          answer?: QuestionOutput["answers"][0];
          question?: never;
      }
    | {
          answer?: never;
          question: QuestionOutput;
      };

type PostProps = CommonPostProps & ConditionalPostProps;

const Post = (props: PostProps) => {
    const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
    const { loading, setLoading } = useLoading();
    const { data: session, status } = useSession();
    const questionsVote = trpc.useMutation(["questions.vote"]);
    const questionsDelete = trpc.useMutation(["questions.delete"]);
    const answersVote = trpc.useMutation(["answers.vote"]);
    const answersDelete = trpc.useMutation(["answers.delete"]);
    const utils = trpc.useContext();
    const router = useRouter();
    const modals = useModals();
    const postType = props.answer ? "answer" : "question";
    const { answer, question } = props;
    const post =
        (answer as QuestionOutput["answers"][0]) ||
        (question as QuestionOutput);
    const [votes, setVotes] = useState(post.votesCount);

    useEffect(() => {
        if (status === "authenticated") {
            setLoading(true);
            // Check if user has voted for this post
            post.votes.forEach((vote) => {
                if (vote.userId === session.userId) {
                    setVoteType(vote.voteType);
                }
            });
            setLoading(false);
        }
    }, [post.votes, session, status, setLoading]);

    useEffect(() => {
        setVotes(post.votesCount);
    }, [post.votesCount]);

    const handleVoteButtonClick = async (voteButtonClickType: VoteType) => {
        if (props.disableVoting) return;
        if (status !== "authenticated") {
            showNotification({
                title: "Please log in",
                message: "You must be logged in to vote",
            });
            return;
        }
        setLoading(true);
        if (voteButtonClickType === voteType) {
            try {
                switch (postType) {
                    case "answer":
                        // Unvote
                        await answersVote.mutateAsync({
                            answerId: post.id,
                            voteType: VoteType.up,
                            remove: true,
                        });
                        break;
                    case "question":
                        // Unvote
                        await questionsVote.mutateAsync({
                            questionId: post.id,
                            voteType: VoteType.up,
                            remove: true,
                        });
                        break;
                }
                setVoteType(null);
                setVotes(
                    voteButtonClickType === VoteType.up ? votes - 1 : votes + 1
                );
                utils.invalidateQueries(["questions.getById"]);
            } catch (e: any) {
                showNotification({
                    title: "Error",
                    message: e,
                });
            }
        } else {
            try {
                switch (postType) {
                    case "answer":
                        await answersVote.mutateAsync({
                            answerId: post.id,
                            voteType: voteButtonClickType,
                            remove: false,
                        });
                        break;
                    case "question":
                        await questionsVote.mutateAsync({
                            questionId: post.id,
                            voteType: voteButtonClickType,
                            remove: false,
                        });
                        break;
                }
                setVoteType(voteButtonClickType);
                if (voteType === null) {
                    setVotes(
                        voteButtonClickType === VoteType.up
                            ? votes + 1
                            : votes - 1
                    );
                } else {
                    setVotes(
                        voteButtonClickType === VoteType.up
                            ? votes + 2
                            : votes - 2
                    );
                }
                utils.invalidateQueries(["questions.getById"]);
            } catch (e: any) {
                showNotification({
                    title: "Error",
                    message: e,
                });
            }
        }
        setLoading(false);
    };

    const handleDeletePostButtonClick = () => {
        modals.openConfirmModal({
            title: `Delete your ${postType}?`,
            children: (
                <Text size="sm">
                    Are you sure you want to delete your {postType}?
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
                    switch (postType) {
                        case "answer":
                            await answersDelete.mutateAsync({
                                answerId: post.id,
                            });
                            showNotification({
                                title: "Answer deleted",
                                message: "Your answer has been deleted",
                            });
                            utils.invalidateQueries(["questions.getById"]);
                            utils.invalidateQueries(["questions.getAll"]);
                            break;
                        case "question":
                            await questionsDelete.mutateAsync({
                                questionId: post.id,
                            });
                            showNotification({
                                title: "Question deleted",
                                message: "Your question has been deleted",
                            });
                            utils.invalidateQueries(["questions.getAll"]);
                            router.back();
                            break;
                    }
                } catch (e: any) {
                    showNotification({
                        title: "Error",
                        message: "Something went wrong",
                    });
                }
                setLoading(false);
            },
        });
    };

    return (
        <div className={"border-b py-4 last:border-b-0"}>
            <div className={"flex"}>
                <div className={"pt-3 flex flex-col w-auto pr-3 items-center"}>
                    <div
                        className={
                            "flex justify-center items-center cursor-pointer"
                        }
                        onClick={() => handleVoteButtonClick(VoteType.up)}
                    >
                        <Icon
                            icon={"bi:arrow-up-circle-fill"}
                            className={
                                "text-3xl transition-all duration-75" +
                                (voteType === "up" ? " text-red-600" : "") +
                                (props.disableVoting
                                    ? " opacity-50 cursor-not-allowed"
                                    : "")
                            }
                        />
                    </div>
                    <div
                        className={
                            "flex justify-center items-center my-4 cursor-pointer"
                        }
                    >
                        <Text className={"text-xl"}>{votes}</Text>
                    </div>
                    <div
                        className={"flex justify-center items-center group"}
                        onClick={() => handleVoteButtonClick(VoteType.down)}
                    >
                        <Icon
                            icon={"bi:arrow-down-circle-fill"}
                            className={
                                "text-3xl transition-all duration-75" +
                                (voteType === "down" ? " text-red-600" : "") +
                                (props.disableVoting
                                    ? " opacity-50 cursor-not-allowed"
                                    : "")
                            }
                        />
                    </div>
                </div>
                <div className={"flex-1"}>
                    <RichTextEditor
                        readOnly
                        value={post.content}
                        onChange={() => {}}
                        styles={{
                            root: {
                                border: "none",
                            },
                        }}
                        editorRef={null}
                    />
                    {question && (
                        <div
                            className={
                                "pl-4 flex gap-x-2 gap-y-1 flex-1 flex-wrap"
                            }
                        >
                            <Badge color="gray">
                                {question.subject.replace("_", " ")}
                            </Badge>
                            <Badge color="gray">Form {question.form}</Badge>
                            {question.tags.length !== 0
                                ? question.tags.map((tag, index) => {
                                      return (
                                          <Badge key={index} color={""}>
                                              {tag.name}
                                          </Badge>
                                      );
                                  })
                                : null}
                        </div>
                    )}

                    <div className={"flex mt-8 justify-end"}>
                        <div className={"bg-slate-200 p-3 rounded"}>
                            <img
                                className={"rounded-md h-8 w-8 mb-2"}
                                src={post.user.image as string}
                                referrerPolicy={"no-referrer"}
                                alt={"avatar"}
                            />
                            <Text className={"text-xs"}>
                                Asked by{" "}
                                <span className={"font-semibold"}>
                                    {post.user.name}
                                </span>
                            </Text>
                            <div className={"flex mt-2"}>
                                {post.user.id === session?.userId && (
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
            {props.hideCommentsSection ? null : (
                <div>
                    <div className={"flex items-center mb-2"}>
                        <Text className={"text-lg font-semibold"}>
                            Comments
                        </Text>
                    </div>
                    <CommentsSection
                        comments={post.comments}
                        commentsSectionType={postType}
                        propertyId={post.id}
                    />
                </div>
            )}
        </div>
    );
};

export default Post;
