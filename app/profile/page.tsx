"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  getUserCreatedTasks,
  getUserTaskCompletions,
} from "@/lib/actions";
import { User, Task, TaskCompletion } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/auth/login");
          return;
        }

        setUser(userData);

        const created = await getUserCreatedTasks(userData.id);
        setCreatedTasks(created);

        const completed = await getUserTaskCompletions(userData.id);
        setCompletedTasks(completed);
      } catch (error) {
        console.error("Error loading profile:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  const approvedCompletions = completedTasks.filter(
    (c) => c.status === "approved"
  ).length;
  const totalPointsEarned = approvedCompletions;
  const totalPointsSpent = createdTasks.reduce(
    (sum, task) => sum + task.reward * task.max_completions,
    0
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">@{user.username}</h1>
                <p className="text-gray-600 mb-4">
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                  <span>🏆</span> {user.points} Points
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Points Balance</p>
              <p className="text-3xl font-bold text-blue-600">{user.points}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Tasks Created</p>
              <p className="text-3xl font-bold">{createdTasks.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {approvedCompletions}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Member Rank</p>
              <p className="text-3xl font-bold">{getRankEmoji(user.points)}</p>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Activity Summary</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-gray-600 mb-2">Points Earned</p>
                <p className="text-3xl font-bold text-green-600">
                  +{totalPointsEarned}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  From {approvedCompletions} completed tasks
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Points Invested</p>
                <p className="text-3xl font-bold text-orange-600">
                  -{totalPointsSpent}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Creating {createdTasks.length} tasks
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Tasks Awaiting Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {completedTasks.filter((c) => c.status === "pending").length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Awaiting creator approval
                </p>
              </div>
            </div>
          </Card>

          {/* Created Tasks */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Created Tasks ({createdTasks.length})</h2>
            {createdTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  You haven't created any tasks yet.
                </p>
                <a href="/create-task">
                  <Button size="md">Create Your First Task</Button>
                </a>
              </Card>
            ) : (
              <div className="grid gap-4">
                {createdTasks.map((task) => (
                  <Card key={task.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{task.title}</h3>
                        <div className="flex gap-2 mb-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {task.platform}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {task.action_type}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {task.reward} pts
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {task.completed_count}/{task.max_completions} completed
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          task.status === "active"
                            ? "bg-green-100 text-green-700"
                            : task.status === "paused"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Completed Tasks */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              Task Completions ({completedTasks.length})
            </h2>
            {completedTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  You haven't completed any tasks yet.
                </p>
                <a href="/browse">
                  <Button size="md">Browse Available Tasks</Button>
                </a>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedTasks.map((completion) => (
                  <Card key={completion.id} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Task ID: {completion.task_id.slice(0, 8)}...</p>
                        <p className="font-semibold">
                          Submitted:{" "}
                          {new Date(completion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          completion.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : completion.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {completion.status.charAt(0).toUpperCase() +
                          completion.status.slice(1)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function getRankEmoji(points: number): string {
  if (points >= 1000) return "👑";
  if (points >= 500) return "🥇";
  if (points >= 200) return "🥈";
  if (points >= 100) return "🥉";
  if (points >= 50) return "⭐";
  return "🌱";
}
