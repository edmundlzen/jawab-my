import { InferQueryOutput } from "../../utils/trpc";
import { QuestionCard } from "../QuestionsView";

type UserDataQueryOutput = InferQueryOutput<"users.getByUsername">;

interface QuestionsTabProps {
    questions: UserDataQueryOutput["questions"];
}

const QuestionsTab = (props: QuestionsTabProps) => {
    return (
        <div>
            {props.questions.map((question) => {
                return <QuestionCard key={question.id} question={question} />;
            })}
        </div>
    );
};

export default QuestionsTab;
