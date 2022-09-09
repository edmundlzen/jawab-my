import { InferQueryOutput } from "../../utils/trpc";
import { AnswerCard } from "../QuestionsView";

type UserDataQueryOutput = InferQueryOutput<"users.getByUsername">;

interface AnswersTabProps {
    answers: UserDataQueryOutput["answers"];
}

const AnswersTab = (props: AnswersTabProps) => {
    return (
        <div>
            {props.answers.map((answer) => {
                return <AnswerCard key={answer.id} answer={answer} />;
            })}
        </div>
    );
};

export default AnswersTab;
