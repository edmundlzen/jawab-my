import { Text } from "@/components/ui/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { InferQueryOutput } from "@/utils/trpc";
import { AskQuestionButton } from "@/features/posts/question";
import { QuestionCard } from "@/features/cards/";

type QuestionsOutput = InferQueryOutput<"questions.getAll">;

interface QuestionViewProps {
    title: string;
    questions: QuestionsOutput;
}

const PostsView = (props: QuestionViewProps) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { title, questions } = props;

    return (
        <div className={"h-full flex flex-col"}>
            <div className={"flex justify-between py-5 border-b"}>
                <Text
                    className={
                        "pl-6 text-xl sm:text-3xl font-semibold capitalize"
                    }
                >
                    {title}
                </Text>
                <AskQuestionButton />
            </div>
            <div className={"flex-1 flex flex-col"}>
                {questions.length === 0 && (
                    <div className={"flex-1 flex justify-center items-center"}>
                        <img
                            src={"/images/memes/no_questions.jpg"}
                            className={"h-[50vh]"}
                        />
                    </div>
                )}
                {questions.map((question, index) => {
                    return <QuestionCard question={question} key={index}/>;
                })}
            </div>
        </div>
    );
};

export default PostsView;
