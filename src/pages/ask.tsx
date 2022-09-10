import type { NextPage, NextPageContext } from "next";
import { Layout } from "../components/Layout";
import { Badge, Button, InputWrapper, Select, TextInput } from "@mantine/core";
import { RichTextEditor } from "../components/RichTextEditor";
import { useCallback, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { usePageLoading } from "../hooks";
import { subjects } from "../constants";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { Form, Subject } from "@prisma/client";

const Ask: NextPage = () => {
    const router = useRouter();
    const [questionTitle, setQuestionTitle] = useState("");
    const [questionContent, setQuestionContent] = useState("");
    const [questionSubject, setQuestionSubject] = useState<string | null>("");
    const [questionForm, setQuestionForm] = useState<string | null>("");
    const [questionTags, setQuestionTags] = useState<any[]>([]);
    const [questionTagsInput, setQuestionTagsInput] = useState("");
    const { data: session, status } = useSession();
    const { pageLoading, setPageLoading } = usePageLoading();
    const createQuestion = trpc.useMutation(["questions.create"]);

    const handleTagsInputSubmit = (tag: string) => {
        if (questionTags.length >= 5) {
            showNotification({
                title: "Error",
                message: "You can only add up to 5 tags",
                color: "red",
            });
            return;
        }
        if (tag.length > 0) {
            setQuestionTags([...questionTags, tag.trim()]);
            setQuestionTagsInput("");
        }
    };

    const handleSubmit = async () => {
        if (
            questionTitle.length === 0 ||
            questionContent.length === 0 ||
            questionSubject === null ||
            questionForm === null
        ) {
            showNotification({
                title: "Error",
                message: "Please fill in all fields",
                color: "red",
                icon: <Icon icon="emojione-monotone:cross-mark" />,
            });
            return;
        }
        setPageLoading(true);

        try {
            await createQuestion.mutateAsync({
                title: questionTitle,
                content: questionContent,
                subject: questionSubject as Subject,
                form: questionForm as Form,
                tags: questionTags,
            });
            showNotification({
                title: "Success",
                message: "Question created",
                color: "green",
                icon: <Icon icon="emojione-monotone:heavy_check_mark" />,
            });
            router.push("/");
        } catch (e) {
            showNotification({
                title: "Error",
                message: "Something went wrong",
                color: "red",
                icon: <Icon icon="emojione-monotone:cross-mark" />,
            });
            setPageLoading(false);
            return;
        }
        setPageLoading(false);
    };

    const handleImageUpload = useCallback(
        (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append("image", file);

                fetch(
                    "https://api.imgbb.com/1/upload?key=26b4138fa708c848faae9936fc69666a",
                    {
                        method: "POST",
                        body: formData,
                    }
                )
                    .then((response) => response.json())
                    .then((result) => resolve(result.data.url))
                    .catch(() => reject(new Error("Upload failed")));
            }),
        []
    );

    return (
        <Layout>
            <div className={"relative"}>
                <div className={"p-5 flex flex-col gap-y-4"}>
                    <h1>Ask a question</h1>
                    <TextInput
                        placeholder="Example: Where is Tunku Abdul Rahman born?"
                        label="Title"
                        required
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                    />
                    <Select
                        label="Subject"
                        required
                        placeholder="Pick a subject"
                        searchable
                        clearable
                        value={questionSubject}
                        onChange={setQuestionSubject}
                        data={Object.keys(subjects).map((subject, index) => ({
                            value: subject,
                            label: subjects[subject],
                        }))}
                    />
                    <Select
                        label="Form"
                        required
                        placeholder="Select a form"
                        searchable
                        clearable
                        value={questionForm}
                        onChange={setQuestionForm}
                        data={[
                            {
                                value: "transition",
                                label: "Peralihan/Transition",
                            },
                            { value: "one", label: "One" },
                            { value: "two", label: "Two" },
                            { value: "three", label: "Three" },
                            { value: "four", label: "Four" },
                            { value: "five", label: "Five" },
                        ]}
                    />
                    <InputWrapper
                        id="question-content"
                        required
                        label="Question"
                        description="Please provide a detailed description of the question"
                    >
                        <RichTextEditor
                            id="question-content"
                            className={"min-h-[50vh]"}
                            value={questionContent}
                            onChange={setQuestionContent}
                            editorRef={null}
                            onImageUpload={handleImageUpload}
                        />
                    </InputWrapper>
                    <div className={"flex flex-wrap gap-y-3"}>
                        {questionTags.length > 0 &&
                            questionTags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    className={"mr-2"}
                                    classNames={{
                                        root: "group",
                                    }}
                                    onClick={() => {
                                        setQuestionTags(
                                            questionTags.filter(
                                                (_, i) => i !== index
                                            )
                                        );
                                    }}
                                    rightSection={
                                        <div
                                            className={
                                                "flex justify-center items-center"
                                            }
                                        >
                                            <Icon
                                                icon="akar-icons:circle-x-fill"
                                                className={
                                                    "text-md group-hover:text-red-500"
                                                }
                                            />
                                        </div>
                                    }
                                >
                                    {tag}
                                </Badge>
                            ))}
                    </div>
                    <TextInput
                        placeholder="Example: quadratic equation, algebra, trigonometry"
                        label="Tags"
                        description={
                            "Please type in a tag followed by pressing enter. Max 5 tags."
                        }
                        value={questionTagsInput}
                        onChange={(e) => setQuestionTagsInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleTagsInputSubmit(
                                    (e.target as HTMLInputElement).value
                                );
                            }
                        }}
                    />
                    <Button
                        className={"mt-5 bg-blue-500"}
                        onClick={async () => handleSubmit()}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default Ask;
