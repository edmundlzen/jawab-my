import { trpc } from "@/utils/trpc";
import { useState } from "react";
import {PostTypes} from "@/features/posts/types";

// This hook allows editing a post
const usePostEdit = (postId: string, postType: PostTypes) => {
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState(false);
	const answersEdit = trpc.useMutation(["answers.update"]);
	const questionsEdit = trpc.useMutation(["questions.update"]);

	const handleEdit = async (newContent: string) => {
		setEditLoading(true);
		try {
			if (postType === PostTypes.ANSWER) {
				await answersEdit.mutateAsync({
					answerId: postId,
					content: newContent,
				});
			} else {
				await questionsEdit.mutateAsync({
					questionId: postId,
					content: newContent,
				});
			}
		} catch (e) {
			setEditError(true);
		}
		setEditLoading(false);
	}

	return {
		editLoading,
		editError,
		handleEdit
	}
}

export default usePostEdit;
