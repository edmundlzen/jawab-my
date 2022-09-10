import {PostTypes} from "@/features/posts/types";
import {usePostVote, usePostDelete, usePostEdit} from "@/features/posts/hooks";
import {usePageLoading} from "@/hooks";
import {useEffect} from "react";

// This hook allows managing a post
const usePost = (postId: string, postType: PostTypes) => {
	const { voteLoading, voteError, handleVote } = usePostVote(postId, postType);
	const { deleteLoading, deleteError, handleDelete } = usePostDelete(postId, postType);
	const { editLoading, editError, handleEdit } = usePostEdit(postId, postType);
	const { pageLoading, setPageLoading } = usePageLoading();

	useEffect(() => {
		setPageLoading(voteLoading || deleteLoading || editLoading);
	}, [voteLoading, deleteLoading, editLoading]);

	return {
		loading: voteLoading || deleteLoading || editLoading,
		error: voteError || deleteError || editError,
		handleVote,
		handleDelete,
		handleEdit,
	}
}

export default usePost;
