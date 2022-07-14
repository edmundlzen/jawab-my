import { Badge, Text } from "@mantine/core";
import { useRouter } from "next/router";
import sanitizeHtml from "sanitize-html";
import { InferQueryOutput } from "../../utils/trpc";

type QuestionsOutput = InferQueryOutput<"questions.getAll">;

const QuestionCard = (props: { question: QuestionsOutput[0] }) => {
    const router = useRouter();

    const daysAgo = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) {
            return "today";
        } else if (days === 1) {
            return "yesterday";
        } else {
            return `${days} days ago`;
        }
    };

    return (
        <div
            className={
                "flex flex-col sm:flex-row min-h-32 w-full border-b border-gray-300 pt-3 sm:pt-5 p-5 cursor-pointer group"
            }
            onClick={() => {
                router.push(
                    `/questions/${props.question.subject}/${props.question.form}/${props.question.id}`
                );
            }}
        >
            <div className={"flex flex-row sm:flex-col justify-start gap-x-2"}>
                <Text className={"text-xs font-bold"}>
                    Votes: {props.question.votesCount}
                </Text>
                <Text className={"text-xs font-semibold"}>Views: N/A</Text>
                <Text className={"text-xs font-semibold"}>
                    Answers: {props.question._count.answers}
                </Text>
            </div>
            <div
                className={
                    "flex-1 flex flex-col justify-center sm:pl-8 sm:w-52"
                }
            >
                <Text
                    className={
                        "text-md sm:text-xl font-semibold text-blue-600 group-hover:font-bold"
                    }
                >
                    {props.question.title}
                </Text>
                <Text className={"text-sm hidden sm:block"} lineClamp={1}>
                    {sanitizeHtml(props.question.content, {
                        allowedTags: [],
                        allowedAttributes: {},
                    })}
                </Text>
                <div className={"mt-4 flex flex-row"}>
                    <div
                        className={
                            "flex gap-x-2 gap-y-1 flex-1 w-6/12 flex-wrap"
                        }
                    >
                        <Badge color="gray">
                            {props.question.subject.replace("_", " ")}
                        </Badge>
                        <Badge color="gray">Form {props.question.form}</Badge>
                        {props.question.tags.length !== 0
                            ? props.question.tags.map((tag, index) => {
                                  return (
                                      <Badge key={index} color={""}>
                                          {tag.name}
                                      </Badge>
                                  );
                              })
                            : null}
                    </div>
                    <div className={"flex flex-col ml-1"}>
                        <div
                            className={
                                "flex flex-row items-center justify-end gap-x-1"
                            }
                        >
                            <img
                                src={
                                    props.question.user.image
                                        ? props.question.user.image
                                        : ""
                                }
                                className={"h-4 rounded-sm"}
                                referrerPolicy={"no-referrer"}
                            />
                            <Text className={"text-xs font-semibold"}>
                                {props.question.user.name}
                            </Text>
                        </div>
                        <div className={"mt-1"}>
                            <Text className={"text-xs font-semibold"}>
                                Posted{" "}
                                {daysAgo(new Date(props.question.createdAt))}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
