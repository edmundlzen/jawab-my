import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";

const Home: NextPage = () => {
  const questions = trpc.useQuery(["questions.getAll"]);

  return (
    <Layout>
      <div className="text-center text-9xl text-blue-900">Hello</div>
      {questions.data &&
        questions.data.map((question) => (
          <div key={question.id}>
            <div className="text-2xl text-blue-900">{question.title}</div>
            <div className="text-xl text-blue-900">{question.content}</div>
          </div>
        ))}
    </Layout>
  );
};

export default Home;
