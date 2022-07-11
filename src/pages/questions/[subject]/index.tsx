import {NextPage} from "next";
import {Layout} from "../../../components/Layout";
import {gql} from "graphql-request";
import {db} from "../../../db";
import {QuestionView} from "../../../components/QuestionsView";
import {Text} from "@mantine/core";

interface Question {
	id: string;
	title: string;
	content: string;
	tags: string[];
	subject: string;
	form: string;
	user_id: string;
	created_at: string;
	updated_at: string;
	votes: number;
	views_count: number
	answers_count: number
	user: {
		profile_image_url: string
		username: string
	}
}

export const getStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	};
}

const getQuestions = async (limit: number, subject: string): Promise<Question[]> => {
    const QUESTIONS_QUERY = gql`
        {
            question(order_by: {created_at: asc}, limit: ${limit}, where: {subject: {_eq: ${subject}}}) {
                id
                subject
                title
                content
                form
                tags
                created_at
                votes {
                    type
                }
                views_aggregate {
                    aggregate {
                        count
                    }
                }
                answers_aggregate {
                    aggregate {
                        count
                    }
                }
                user {
                    profile_image_url
                    username
                }
            }
        }
	`;
	const data = await db.request(QUESTIONS_QUERY);

	return data.question.map((question: any) => {
		return {
			...question,
			votes: question.votes.reduce(((acc: number, vote: { type: string }) => {
				if (vote.type === 'up') {
					return acc + 1;
				}
				return acc - 1;
			}), 0),
			views_count: question.views_aggregate.aggregate.count,
			answers_count: question.answers_aggregate.aggregate.count,
			user: question.user
		}
	});
}

export const getStaticProps = async ({params}: { params: { subject: string } }) => {
	const {subject} = params;
	const questions = await getQuestions(20, subject);

	return {
		props: {
			subject: subject.replaceAll('_', ' '),
			questions,
		},
	}
}


interface SubjectViewProps {
	subject: string;
	questions: Question[] | null;
}

const SubjectView: NextPage<SubjectViewProps> = (props) => {
	return (
		<Layout>
			{
				props.questions && props.questions.length > 0 ?
					<QuestionView title={props.subject} questions={props.questions}/>
					:
					<div className={'h-full flex flex-col justify-center items-center'}>
						<Text className={'text-3xl font-semibold text-blue-600'}>
							No questions found
						</Text>
						<Text className={'mt-2 text-lg text-gray-600'}>
							There are no questions for <span className={'capitalize'}>{props.subject}</span> yet.
						</Text>
					</div>
			}
		</Layout>
	)
}

export default SubjectView;