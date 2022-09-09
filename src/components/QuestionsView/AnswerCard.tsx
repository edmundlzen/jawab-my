import { Icon } from "@iconify/react";
import { Badge, Button, Divider, LoadingOverlay, Text } from "@mantine/core";
import { RichTextEditor } from "../RichTextEditor";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import moment from "moment";
import { Textarea } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useLoading } from "../../hooks";
import { useSession } from "next-auth/react";
import { InferQueryOutput } from "../../utils/trpc";
import { VoteType } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import sanitizeHtml from "sanitize-html";

type AnswerOutput = InferQueryOutput<"users.getByUsername">["answers"][0];

type AnswerCardProps = {
    answer: AnswerOutput;
};

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

const AnswerCard = (props: AnswerCardProps) => {
    const { data: session, status } = useSession();
    const utils = trpc.useContext();
    const router = useRouter();

    return (
        <div
            className={
                "flex flex-col sm:flex-row min-h-32 w-full border-b border-gray-300 pt-3 sm:pt-5 p-5 cursor-pointer group"
            }
            onClick={() => {
                router.push(
                    `/questions/${props.answer.question.subject}/${props.answer.question.form}/${props.answer.question.id}`
                );
            }}
        >
            <div className={"flex flex-row sm:flex-col justify-start gap-x-2"}>
                <Text className={"text-xs font-bold"}>
                    Votes: {props.answer.votesCount}
                </Text>
                <Text className={"text-xs font-semibold"}>
                    Comments: {props.answer._count.comments}
                </Text>
                {/* <Text className={"text-xs font-semibold"}>
                    Answers: {props.question._count.answers}
                </Text> */}
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
                    {props.answer.question.title}
                </Text>
                <Text className={"text-sm hidden sm:block"} lineClamp={1}>
                    {sanitizeHtml(props.answer.content, {
                        allowedTags: [],
                        allowedAttributes: {},
                    }).length > 100
                        ? sanitizeHtml(props.answer.content, {
                              allowedTags: [],
                              allowedAttributes: {},
                          }).substring(0, 100) + "..."
                        : sanitizeHtml(props.answer.content, {
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
                            {props.answer.question.subject.replace("_", " ")}
                        </Badge>
                        <Badge color="gray">
                            Form {props.answer.question.form}
                        </Badge>
                        {props.answer.question.tags.length !== 0
                            ? props.answer.question.tags.map((tag, index) => {
                                  return (
                                      <Badge key={index} color={""}>
                                          {tag.name}
                                      </Badge>
                                  );
                              })
                            : null}
                    </div>
                    <div className={"flex flex-col ml-1"}>
                        <div className={"mt-1"}>
                            <Text className={"text-xs font-semibold"}>
                                Answered{" "}
                                {daysAgo(new Date(props.answer.createdAt))}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
