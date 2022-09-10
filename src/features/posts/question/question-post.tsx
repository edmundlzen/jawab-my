import {InferQueryOutput, trpc} from "@/utils/trpc";
import {VoteType} from "@prisma/client";
import {Post} from "@/features/posts/";
import {usePost} from "@/features/posts/hooks";
import {PostTypes} from "@/features/posts/types";
import {useState} from "react";
import {useSession} from "next-auth/react";

type QuestionOutput = InferQueryOutput<"questions.getById">;

interface QuestionPostProps {
	question: QuestionOutput;
}

const QuestionPost = (props: QuestionPostProps) => {
	const {
		question,
	} = props;
	const utils = trpc.useContext();
	const { data: session, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const {loading, error, handleVote, handleDelete, handleEdit} = usePost(question.id, PostTypes.QUESTION);

	return <Post
		initialContent={question.content}
		votesCount={question.votesCount}
		voteType={question.votes.reduce((acc: VoteType | null, vote) => {
			if (vote.userId === session?.userId) {
				acc = vote.voteType;
			}
			return acc;
		}, null)}
		tags={question.tags}
		userImageURL={question.user.image}
		userName={question.user.username}
		isLoading={isLoading}
		isOwner={question.user.id === session?.userId}
		handleEditPost={handleEdit}
		handleVotePost={handleVote}
		handleDeletePost={handleDelete}
	/>;
};

export default QuestionPost;
