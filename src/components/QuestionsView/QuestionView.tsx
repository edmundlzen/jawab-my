import { Button, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QuestionCard } from "./index";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { InferQueryOutput } from "../../utils/trpc";

type QuestionsOutput = InferQueryOutput<'questions.getAll'>

interface QuestionViewProps {
  title: string;
  questions: QuestionsOutput;
}

const QuestionView = (props: QuestionViewProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { title, questions } = props;

  return (
    <div className={"h-full flex flex-col"}>
      <div className={"flex justify-between pt-5"}>
        <Text className={"pl-6 text-xl sm:text-3xl font-semibold capitalize"}>
          {title}
        </Text>
        <Button
          className={"bg-teal-400 mr-4"}
          color={"teal"}
          onClick={async () => {
            if (status === "authenticated") {
              showNotification({
                title: "Please log in",
                message: "You must be logged in to ask a question",
              });
              return;
            }
            await router.push("/ask");
          }}
        >
          <Text className={"text-sm"}>Ask question</Text>
        </Button>
      </div>
      <div className={"flex-1 flex pt-6 flex-col"}>
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
    </div>
  );
};

export default QuestionView;
