import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";

const Home: NextPage = () => {
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

  return (
    <Layout>
      <div className="text-center text-9xl text-blue-900">Hello</div>
    </Layout>
  );
};

export default Home;
