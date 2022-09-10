import { Card } from "@/features/cards";
import { InferQueryOutput } from "@/utils/trpc";
import {useRouter} from "next/router";

type QuestionsOutput = InferQueryOutput<"questions.getAll">;

interface QuestionCardProps {
    question: QuestionsOutput[0];
}

const QuestionCard = (props: QuestionCardProps) => {
    const {
        question
    } = props;
    const router = useRouter();

    return <Card
        title={question.title}
        content={question.content}
        tags={question.tags}
        votesCount={question.votesCount}
        viewCount={question._count.views}
        answersCount={question._count.answers}
        userImageURL={question.user.image}
        userName={question.user.username}
        createdAt={question.createdAt}
        subjectTag={question.subject}
        formTag={question.form}
        onClick={() => {
            router.push(`/questions/${question.subject}/${question.form}/${question.id}`);
        }}
    />;
}

export default QuestionCard;