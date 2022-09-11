import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { InferQueryOutput } from "@/utils/trpc";
import { QuestionCard } from "@/features/cards/";

type QuestionsOutput = InferQueryOutput<"questions.getAll">;

interface QuestionViewProps {
    questions: QuestionsOutput;
}

const PostsView = (props: QuestionViewProps) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { questions } = props;

    return (
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
                return <QuestionCard question={question} key={index} />;
            })}
        </div>
    );
};

export default PostsView;
