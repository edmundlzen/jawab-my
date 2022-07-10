import { Button, Text, Textarea } from "@mantine/core";
import moment from "moment";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useLoading } from "../../hooks";

interface Comment {
    id: string;
    user: {
        id: string;
        username: string;
        profile_image_url: string;
    };
    content: string;
    created_at: string;
    updated_at: string;
}

interface CommentSectionProps {
    comments: Comment[];
    onCommentSubmit: (comment: string) => void;
}

const CommentsSection = (props: CommentSectionProps) => {
    const [commentBoxVisible, setCommentBoxVisible] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    // const {isLoaded, userId, sessionId, getToken} = useAuth();
    const { loading, setLoading } = useLoading();
    const modals = useModals();
    const router = useRouter();

    // const handleCommentDeleteButton = async (commentId: string) => {
    // 	if (!localStorage.getItem('accessToken')) {
    // 		showNotification({
    // 			title: 'Please log in',
    // 			message: 'You must be logged in to comment',
    // 		})
    // 		return;
    // 	}
    // 	modals.openConfirmModal({
    // 		title: 'Delete your comment?',
    // 		children: (
    // 			<Text size="sm">
    // 				Are you sure you want to delete your comment?
    // 			</Text>
    // 		),
    // 		labels: {confirm: 'Confirm', cancel: 'Cancel'},
    // 		confirmProps: {
    // 			className: 'bg-red-500',
    // 			color: 'red'
    // 		},
    // 		onCancel: () => {
    // 		},
    // 		onConfirm: async () => {
    // 			setLoading(true)
    // 			try {
    // 				const accessToken = await getToken({'hasura'});
    // 				if (!accessToken) return;
    // 				await api(accessToken)?.({
    // 					method: 'delete',
    // 					url: '/comments',
    // 					data: {
    // 						commentId,
    // 					}
    // 				});
    // 				showNotification({
    // 					title: 'Comment deleted',
    // 					message: 'Your comment has been deleted',
    // 				});
    // 				await router.reload();
    // 				return;
    // 			} catch (e) {
    // 				showNotification({
    // 					title: 'Error',
    // 					message: 'Something went wrong',
    // 				})
    // 				setLoading(false)
    // 				return;
    // 			}
    // 		},
    // 	});
    // };

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
                                        {comment.user.username}
                                    </span>{" "}
                                    -{" "}
                                    <span
                                        className={
                                            "text-xs font-semibold opacity-75"
                                        }
                                    >
                                        {moment(
                                            new Date(comment.created_at)
                                        ).format("MMM Do YYYY [at] h:mm a")}
                                    </span>
                                </Text>
                                {/* {
										comment.user.id === globals.userId && (
											<div className={'group cursor-pointer select-none'}
												 onClick={() => handleCommentDeleteButton(comment.id)}>
												<Text
													className={'text-xs text-red-600 group-hover:font-semibold'}>Delete</Text>
											</div>
										)
									} */}
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
                        if (!localStorage.getItem("accessToken")) {
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
                                props.onCommentSubmit(commentContent);
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
