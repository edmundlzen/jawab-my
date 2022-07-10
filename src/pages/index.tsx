import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";
import { QuestionView } from "../components/QuestionsView";
import { useEffect } from "react";
import { useLoading } from "../hooks";

const Home: NextPage = () => {
  const questions = trpc.useQuery(["questions.getAll"]);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!setLoading) return;
    setLoading(questions.isLoading);
  }, [questions, setLoading]);

  return (
    <Layout>
      {questions.data && (
        <QuestionView questions={questions.data} title="Questions" />
      )}
    </Layout>
  );
};

export default Home;
