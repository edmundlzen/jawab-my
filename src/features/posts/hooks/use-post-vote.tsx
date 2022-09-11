import { VoteType } from "@prisma/client";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import { useState } from "react";
import { PostTypes } from "@/features/posts/types";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { useSession } from "next-auth/react";

type QuestionOutput = InferQueryOutput<"questions.getById">;

// This hook allows voting and removing votes from posts
const usePostVote = (postId: string, postType: PostTypes) => {
    const [voteLoading, setVoteLoading] = useState(false);
    const [voteError, setError] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: session, status } = useSession();
    const utils = trpc.useContext();
    const questionId = router.query.question_id as string;

    const optimisticallyUpdateVote = (
        voteType: VoteType,
        prevVoteType: VoteType | null,
        prevVoteCount: number,
        queryKey: []
    ) => {};
    const answersVote = trpc.useMutation(["answers.vote"], {
        onMutate: async (variables: { voteType: VoteType }) => {
            const { voteType } = variables;
            const url = router.pathname;
            switch (url) {
                case "/questions/[subject]/[form]/[question_id]":
                    await queryClient.cancelQueries([
                        "questions.getById",
                        { questionId },
                    ]);

                    const previousAnswer = (
                        queryClient.getQueryData([
                            "questions.getById",
                            { questionId },
                        ]) as QuestionOutput
                    ).answers.find((answer) => answer.id === postId);
                    const previousVoteType: VoteType | null =
                        previousAnswer?.votes.find(
                            (vote) => vote.userId === session?.userId
                        )?.voteType || null;
                    const previousVotesCount = (previousAnswer as any)
                        .votesCount;
                    console.log(
                        `New vote type: ${voteType}, previous vote type: ${previousVoteType}`
                    );
                    let newVotesCount = previousVotesCount;
                    if (previousVoteType === voteType) {
                        // If the user is removing their vote
                        newVotesCount += voteType === VoteType.up ? -1 : 1;
                    } else if (previousVoteType) {
                        // If the user is changing their vote
                        newVotesCount += voteType === VoteType.up ? 2 : -2;
                    } else {
                        // If the user is adding a vote
                        newVotesCount += voteType === VoteType.up ? 1 : -1;
                    }

                    queryClient.setQueryData(
                        ["questions.getById", { questionId }],
                        (oldQuestion: any) => {
                            return {
                                ...oldQuestion,
                                answers: oldQuestion.answers.map(
                                    (answer: any) => {
                                        if (answer.id === postId) {
                                            return {
                                                ...answer,
                                                votesCount: newVotesCount,
                                                votes: previousVoteType
                                                    ? answer.votes
                                                          .map((vote: any) => {
                                                              if (
                                                                  vote.userId ===
                                                                  session?.userId
                                                              ) {
                                                                  if (
                                                                      voteType ===
                                                                      previousVoteType
                                                                  )
                                                                      return null;
                                                                  return {
                                                                      ...vote,
                                                                      voteType:
                                                                          voteType,
                                                                  };
                                                              }
                                                              return vote;
                                                          })
                                                          .filter(
                                                              (vote: any) =>
                                                                  vote
                                                          )
                                                    : [
                                                          ...answer.votes,
                                                          {
                                                              answerId: postId,
                                                              id: "temp",
                                                              userId: session?.userId,
                                                              voteType,
                                                          },
                                                      ],
                                            };
                                        }
                                        return answer;
                                    }
                                ),
                            };
                        }
                    );
                    await utils.invalidateQueries(["questions.getAll"]);
                    await utils.invalidateQueries(["questions.getBySubject"]);
                    break;
            }
        },
        onError: (err, variables, context: any) => {
            queryClient.setQueryData(
                ["questions.getById", { questionId }],
                context.previousQuestion
            );
        },
        onSettled: async () => {
            await queryClient.invalidateQueries([
                "questions.getById",
                { questionId },
            ]);
        },
    });
    const questionsVote = trpc.useMutation(["questions.vote"], {
        onMutate: async (variables: { voteType: VoteType }) => {
            const { voteType } = variables;
            const url = router.pathname;
            switch (url) {
                case "/questions/[subject]/[form]/[question_id]":
                    await queryClient.cancelQueries([
                        "questions.getById",
                        { questionId },
                    ]);

                    const previousQuestion = queryClient.getQueryData([
                        "questions.getById",
                        { questionId },
                    ]) as QuestionOutput;
                    const previousVoteType: VoteType | null =
                        previousQuestion.votes.find(
                            (vote) => vote.userId === session?.userId
                        )?.voteType || null;
                    const previousVotesCount = previousQuestion.votesCount;
                    console.log(
                        `New vote type: ${voteType}, previous vote type: ${previousVoteType}`
                    );
                    let newVotesCount = previousVotesCount;
                    if (previousVoteType === voteType) {
                        // If the user is removing their vote
                        newVotesCount += voteType === VoteType.up ? -1 : 1;
                    } else if (previousVoteType) {
                        // If the user is changing their vote
                        newVotesCount += voteType === VoteType.up ? 2 : -2;
                    } else {
                        // If the user is adding a vote
                        newVotesCount += voteType === VoteType.up ? 1 : -1;
                    }

                    queryClient.setQueryData(
                        ["questions.getById", { questionId }],
                        (oldQuestion: any) => {
                            return {
                                ...oldQuestion,
                                votesCount: newVotesCount,
                                votes: previousVoteType
                                    ? oldQuestion.votes
                                          .map((vote: any) => {
                                              if (
                                                  vote.userId ===
                                                  session?.userId
                                              ) {
                                                  if (
                                                      voteType ===
                                                      previousVoteType
                                                  )
                                                      return null;
                                                  return {
                                                      ...vote,
                                                      voteType: voteType,
                                                  };
                                              }
                                              return vote;
                                          })
                                          .filter((vote: any) => vote)
                                    : [
                                          ...oldQuestion.votes,
                                          {
                                              questionId,
                                              id: "temp",
                                              userId: session?.userId,
                                              voteType,
                                          },
                                      ],
                            };
                        }
                    );
                    break;
            }
        },
        onError: (err, variables, context: any) => {
            queryClient.setQueryData(
                ["questions.getById", { questionId }],
                context.previousQuestion
            );
        },
        onSettled: async () => {
            await queryClient.invalidateQueries([
                "questions.getById",
                { questionId },
            ]);
        },
    });

    const handleVote = async (
        voteType: VoteType,
        prevVoteType: VoteType | null
    ) => {
        try {
            if (postType === PostTypes.ANSWER) {
                await answersVote.mutateAsync({
                    answerId: postId,
                    voteType,
                    remove: prevVoteType === voteType,
                });
            } else {
                await questionsVote.mutateAsync({
                    questionId: postId,
                    voteType,
                    remove: prevVoteType === voteType,
                });
            }
        } catch (e) {
            setError(true);
        }
        // setVoteLoading(false);
    };

    return {
        voteLoading,
        voteError,
        handleVote,
    };
};

export default usePostVote;
