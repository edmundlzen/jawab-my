import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";
import { QuestionView } from "../components/QuestionsView";
import { InferQueryOutput } from "../utils/trpc";

const Home: NextPage = () => {
  const questions = trpc.useQuery(["questions.getAll"]);

  return (
    <Layout>
      {questions.data && (
        <QuestionView questions={questions.data} title="Questions" />
      )}
    </Layout>
  );
};

export default Home;
