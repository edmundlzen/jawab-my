import {trpc} from "@/utils/trpc";
import {useState} from "react";
import {PostTypes} from "@/features/posts/types";

// This hook allows deleting a post
const usePostDelete = (postId: string, postType: PostTypes) => {
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState(false);
	const answersDelete = trpc.useMutation(["answers.delete"]);
	const questionsDelete = trpc.useMutation(["questions.delete"]);

	const handleDelete = async () => {
		setDeleteLoading(true);
		try {
			if (postType === PostTypes.ANSWER) {
				await answersDelete.mutateAsync({
					answerId: postId,
				});
			} else {
				await questionsDelete.mutateAsync({
					questionId: postId,
				});
			}
		} catch (e) {
			setDeleteError(true);
		}
		setDeleteLoading(false);
	}

	return {
		deleteLoading,
		deleteError,
		handleDelete,
	}
}

export default usePostDelete;
