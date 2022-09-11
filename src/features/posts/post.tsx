import { Icon } from "@iconify/react";
import { Badge, Button, Text } from "@/components/ui/core";
import { LoadingOverlay } from "@mantine/core";
import { RichTextEditor } from "@/components/ui/core/";
import { useState } from "react";
import { Tag, VoteType } from "@prisma/client";

type PostProps = {
    initialContent: string;
    votesCount: number;
    voteType: VoteType | null;
    tags?: Tag[];
    userImageURL?: string | null;
    userName: string;
    disableVoting?: boolean;
    hideCommentsSection?: boolean;
    isLoading: boolean;
    isOwner: boolean;
    handleEditPost: (text: string) => void;
    handleVotePost: (voteType: VoteType, prevVoteType: VoteType | null) => void;
    handleDeletePost: () => void;
};

const Post = (props: PostProps) => {
    const {
        initialContent,
        votesCount,
        voteType,
        tags,
        userImageURL,
        userName,
        disableVoting,
        hideCommentsSection,
        isLoading,
        isOwner,
        handleEditPost,
        handleVotePost,
        handleDeletePost,
    } = props;
    const [editable, setEditable] = useState(false);
    const [postContent, setPostContent] = useState<string>(initialContent);

    return (
        <div className={"border-b py-4 last:border-b-0"}>
            <div className={"flex"}>
                <div className={"pt-3 flex flex-col w-auto pr-3 items-center"}>
                    <button
                        className={
                            "flex justify-center items-center cursor-pointer"
                        }
                        onClick={() => handleVotePost(VoteType.up, voteType)}
                    >
                        <Icon
                            icon={"bi:arrow-up-circle-fill"}
                            className={
                                "text-3xl transition-all duration-75" +
                                (voteType === "up" ? " text-red-600" : "") +
                                (disableVoting
                                    ? " opacity-50 cursor-not-allowed"
                                    : "")
                            }
                        />
                    </button>
                    <div
                        className={
                            "flex justify-center items-center my-4 select-none"
                        }
                    >
                        <Text className={"text-xl"}>{votesCount}</Text>
                    </div>
                    <button
                        className={
                            "flex justify-center items-center group cursor-pointer"
                        }
                        onClick={() => handleVotePost(VoteType.down, voteType)}
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
                    </button>
                </div>
                <div className={"flex-1 relative"}>
                    <LoadingOverlay visible={isLoading} />
                    <div className={editable ? "border rounded-md mb-2" : ""}>
                        <RichTextEditor
                            readOnly={!editable}
                            value={postContent}
                            onChange={setPostContent}
                            styles={{
                                root: {
                                    border: "none",
                                },
                            }}
                            editorRef={null}
                        />
                    </div>
                    {editable && (
                        <div className={"flex justify-end mb-6"}>
                            <Button
                                onClick={() => handleEditPost(postContent)}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    {tags && (
                        <div
                            className={
                                "pl-4 flex gap-x-2 gap-y-1 flex-1 flex-wrap"
                            }
                        >
                            {tags.length !== 0
                                ? tags.map((tag, index) => {
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
                                src={userImageURL as string}
                                referrerPolicy={"no-referrer"}
                                alt={"avatar"}
                            />
                            <Text className={"text-xs"}>
                                Asked by{" "}
                                <span className={"font-semibold"}>
                                    {userName}
                                </span>
                            </Text>
                            <div className={"flex flex-col mt-2"}>
                                {isOwner && (
                                    <>
                                        <div
                                            className={
                                                "cursor-pointer select-none group"
                                            }
                                            onClick={() => handleDeletePost()}
                                        >
                                            <Text
                                                className={
                                                    "text-xs text-red-600 group-hover:font-semibold"
                                                }
                                            >
                                                Delete
                                            </Text>
                                        </div>
                                        <div
                                            className={
                                                "cursor-pointer select-none group"
                                            }
                                            onClick={() =>
                                                setEditable(!editable)
                                            }
                                        >
                                            <Text
                                                className={
                                                    "text-xs text-blue-500 group-hover:font-semibold"
                                                }
                                            >
                                                {editable ? "Cancel" : "Edit"}
                                            </Text>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*	Comments */}
            {hideCommentsSection ? null : (
                <div>
                    <div className={"flex items-center mb-2"}>
                        <Text className={"text-lg font-semibold"}>
                            Comments
                        </Text>
                    </div>
                    {/*<CommentsSection*/}
                    {/*    comments={comments}*/}
                    {/*    commentsSectionType={postType}*/}
                    {/*    propertyId={post.id}*/}
                    {/*/>*/}
                </div>
            )}
        </div>
    );
};

export default Post;
