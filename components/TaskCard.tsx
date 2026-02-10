import Link from "next/link";
import { Task } from "@/lib/types";
import Card from "./Card";
import PlatformIcon from "./PlatformIcon";

interface TaskCardProps {
  task: Task;
  creator?: { username: string };
}

export default function TaskCard({ task, creator }: TaskCardProps) {
  const actionEmojis: { [key: string]: string } = {
    follow: "👥",
    subscribe: "🔔",
    like: "❤️",
    comment: "💬",
  };

  const actionEmoji = actionEmojis[task.action_type.toLowerCase()] || "✨";

  const remainingCompletions = task.max_completions - task.completed_count;

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="cursor-pointer p-5 hover:border-blue-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">
              <PlatformIcon platform={task.platform} className="w-7 h-7" />
            </div>
            <span className="text-2xl">{actionEmoji}</span>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            +{task.reward} pts
          </div>
        </div>

        <h3 className="font-bold text-lg mb-1">{task.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {task.platform}
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {task.action_type}
          </span>
        </div>

        {creator && (
          <p className="text-sm text-gray-600 mb-2">by @{creator.username}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {remainingCompletions} of {task.max_completions} remaining
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${(task.completed_count / task.max_completions) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
