import { InferQueryOutput } from "../../utils/trpc";
import { AnswerPost } from "../Questions";

type UserDataQueryOutput = InferQueryOutput<"users.getMe">;

interface AnswersTabProps {
    answers: UserDataQueryOutput["answers"];
}

const AnswersTab = (props: AnswersTabProps) => {
    return (
        <div>
            {props.answers.map((answer) => {
                return <AnswerPost key={answer.id} answer={answer} />;
            })}
        </div>
    );
};

export default AnswersTab;
