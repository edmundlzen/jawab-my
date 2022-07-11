import { NextPage } from "next";
import { Layout } from "../../../components/Layout";
import { trpc } from "../../../utils/trpc";
import { QuestionView } from "../../../components/QuestionsView";
import { Text } from "@mantine/core";
import { useRouter } from "next/router";
import { Subject } from "@prisma/client";
import { useEffect } from "react";
import { useLoading } from "../../../hooks";

interface SubjectViewProps {
    // subject: string;
    // questions: Question[] | null;
}

const SubjectView: NextPage<SubjectViewProps> = (props) => {
    const router = useRouter();
    const questions = trpc.useQuery([
        "questions.getBySubject",
        { subject: router.query.subject as Subject },
    ]);
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(questions.isLoading);
    }, [questions, setLoading]);

    return (
        <Layout>
            {questions.data && questions.data.length > 0 ? (
                <QuestionView
                    title={router.query.subject as string}
                    questions={questions.data}
                />
            ) : (
                <div
                    className={
                        "h-full flex flex-col justify-center items-center"
                    }
                >
                    <Text className={"text-3xl font-semibold text-blue-600"}>
                        No questions found
                    </Text>
                    <Text className={"mt-2 text-lg text-gray-600"}>
                        There are no questions for{" "}
                        <span className={"capitalize"}>
                            {router.query.subject as string}
                        </span>{" "}
                        yet.
                    </Text>
                </div>
            )}
        </Layout>
    );
};

export default SubjectView;
