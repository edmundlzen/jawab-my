import { InferQueryOutput } from "../../utils/trpc";
import { Post } from "../Questions";

type UserDataQueryOutput = InferQueryOutput<"users.getMe">;

interface AnswersTabProps {
    answers: UserDataQueryOutput["answers"];
}

const AnswersTab = (props: AnswersTabProps) => {
    return (
        <div>
            {props.answers.map((answer) => {
                return <Post key={answer.id} answer={answer} />;
            })}
        </div>
    );
};

export default AnswersTab;
