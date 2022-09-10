import type { GetStaticPropsContext, NextPage } from "next";
import { trpc } from "../utils/trpc";
import { Layout } from "../components/Layout";
import { QuestionView } from "../components/QuestionsView";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "../server/router";
import superjson from "superjson";
import { createContext } from "../server/router/context";

export async function getStaticProps(context: GetStaticPropsContext<{}>) {
    const ssg = await createSSGHelpers({
        router: appRouter,
        ctx: await createContext(),
        transformer: superjson, // optional - adds superjson serialization
    });

    await ssg.fetchQuery("questions.getAll");

    return {
        props: {
            trpcState: ssg.dehydrate(),
        },
        revalidate: 1,
    };
}

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
