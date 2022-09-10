import {Badge, Text} from "@/components/ui/core";
import daysAgo from "@/utils/days-ago";
import { Tag } from "@prisma/client";

interface CardProps {
	title: string;
	content: string;
	tags: Tag[];
	subjectTag?: string;
	formTag?: string;
	onClick?: () => void;
	votesCount: number;
	viewCount: number;
	answersCount: number;
	userImageURL?: string | null;
	userName: string;
	createdAt: Date;
}

const Card = (props: CardProps) => {
	const {
		title,
		content,
		tags,
		subjectTag,
		formTag,
		onClick,
		votesCount,
		viewCount,
		answersCount,
		userImageURL,
		userName,
		createdAt,
	} = props;

	return (
		<div
			className={
				"flex flex-col sm:flex-row min-h-32 w-full border-b border-gray-300 pt-3 sm:pt-5 p-5 cursor-pointer group"
			}
			onClick={() => onClick && onClick()}
		>
			<div className={"flex flex-row sm:flex-col justify-start gap-x-2"}>
				<Text className={"text-xs font-bold"}>
					Votes: {votesCount}
				</Text>
				<Text className={"text-xs font-semibold"}>
					Views: {viewCount}
				</Text>
				<Text className={"text-xs font-semibold"}>
					Answers: {answersCount}
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
					{title}
				</Text>
				<Text className={"text-sm hidden sm:block"} lineClamp={1}>
					{content.length > 100
						? content.substring(0, 100) + "..."
						: content
					}
				</Text>
				<div className={"mt-4 flex flex-row"}>
					<div
						className={
							"flex gap-x-2 gap-y-1 flex-1 w-6/12 flex-wrap"
						}
					>
						{subjectTag && (
							<Badge color="gray">
								{props.subjectTag}
							</Badge>
						)}
						{formTag && (
							<Badge color="gray">
								{props.formTag}
							</Badge>
						)}
						{tags.length !== 0
							? tags.map((tag, index) => {
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
									userImageURL
										? userImageURL
										: ""
								}
								className={"h-4 rounded-sm"}
								referrerPolicy={"no-referrer"}
							/>
							<Text className={"text-xs font-semibold"}>
								{userName}
							</Text>
						</div>
						<div className={"mt-1"}>
							<Text className={"text-xs font-semibold"}>
								Posted{" "}
								{daysAgo(createdAt)}
							</Text>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Card;