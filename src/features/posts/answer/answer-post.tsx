import {InferQueryOutput} from "@/utils/trpc";
import {VoteType} from "@prisma/client";
import {Post} from "@/features/posts/";
import {usePost} from "@/features/posts/hooks";
import {PostTypes} from "@/features/posts/types";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {usePageLoading} from "@/hooks";

type QuestionOutput = InferQueryOutput<"questions.getById">;

interface AnswerPostProps {
	answer: QuestionOutput["answers"][0];
}

const AnswerPost = (props: AnswerPostProps) => {
	const {
		answer,
	} = props;
	const { data: session, status } = useSession();
	const {loading, error, handleVote, handleDelete, handleEdit} = usePost(answer.id, PostTypes.ANSWER);
	const { pageLoading, setPageLoading } = usePageLoading();

	useEffect(() => {
		if (loading) {
			setPageLoading(true);
		} else {
			setPageLoading(false);
		}
	}, [loading]);

	return <Post
		initialContent={answer.content}
		votesCount={answer.votesCount}
		voteType={answer.votes.reduce((acc: VoteType | null, vote) => {
			if (vote.userId === session?.userId) {
				acc = vote.voteType;
			}
			return acc;
		}, null)}
		userImageURL={answer.user.image}
		userName={answer.user.username}
		isLoading={loading}
		isOwner={answer.user.id === session?.userId}
		handleEditPost={handleEdit}
		handleVotePost={handleVote}
		handleDeletePost={handleDelete}
	/>;
};

export default AnswerPost;
