"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getTask,
  getTaskCompletions,
  approveTaskCompletion,
  rejectTaskCompletion,
  getCurrentUser,
} from "@/lib/actions";
import { Task, TaskCompletion, User } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function TaskManagePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTask() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/auth/login");
          return;
        }

        setCurrentUser(userData);

        const taskData = await getTask(taskId);
        if (!taskData) {
          setError("Task not found");
          return;
        }

        // Check if current user is the creator
        if (taskData.creator_id !== user.id) {
          setError("You don't have permission to manage this task");
          router.push("/dashboard");
          return;
        }

        setTask(taskData);

        const completionsData = await getTaskCompletions(taskId);
        setCompletions(completionsData);
      } catch (err: any) {
        console.error("Error loading task:", err);
        setError("Error loading task");
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId, router]);

  const handleApprove = async (completionId: string) => {
    setProcessing(completionId);
    try {
      await approveTaskCompletion(completionId);

      // Update local state
      setCompletions(
        completions.map((c) =>
          c.id === completionId ? { ...c, status: "approved" } : c
        )
      );

      // Reload task to get updated count
      if (task) {
        const updatedTask = await getTask(task.id);
        if (updatedTask) {
          setTask(updatedTask);
        }
      }
    } catch (err: any) {
      setError("Failed to approve: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (completionId: string) => {
    setProcessing(completionId);
    try {
      await rejectTaskCompletion(completionId);

      // Update local state
      setCompletions(
        completions.map((c) =>
          c.id === completionId ? { ...c, status: "rejected" } : c
        )
      );
    } catch (err: any) {
      setError("Failed to reject: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading task...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!task || error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mt-4 font-semibold"
            >
              Go back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const pendingCompletions = completions.filter((c) => c.status === "pending");
  const approvedCompletions = completions.filter((c) => c.status === "approved");
  const rejectedCompletions = completions.filter((c) => c.status === "rejected");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
          >
            ← Back
          </button>

          <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              <div>
                <p className="text-gray-600 text-sm">Reward per completion</p>
                <p className="text-2xl font-bold">{task.reward} pts</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Progress</p>
                <p className="text-2xl font-bold">
                  {task.completed_count}/{task.max_completions}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCompletions.length}
                </p>
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Pending Completions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Pending Review ({pendingCompletions.length})
            </h2>
            {pendingCompletions.length === 0 ? (
              <Card className="p-8 text-center text-gray-600">
                No pending completions
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingCompletions.map((completion) => (
                  <Card key={completion.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Submission ID: {completion.id.slice(0, 8)}...
                        </p>
                        <p className="font-semibold">
                          Submitted:{" "}
                          {new Date(completion.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Pending
                      </span>
                    </div>

                    {completion.proof_url && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Proof reference: {completion.proof_url}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(completion.id)}
                        loading={processing === completion.id}
                        disabled={processing !== null}
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(completion.id)}
                        loading={processing === completion.id}
                        disabled={processing !== null}
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Approved Completions */}
          {approvedCompletions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                Approved ({approvedCompletions.length})
              </h2>
              <div className="space-y-3">
                {approvedCompletions.map((completion) => (
                  <Card key={completion.id} className="p-4 bg-green-50 border-green-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Approved:{" "}
                        {new Date(completion.updated_at).toLocaleDateString()}
                      </p>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Approved
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Rejected Completions */}
          {rejectedCompletions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Rejected ({rejectedCompletions.length})
              </h2>
              <div className="space-y-3">
                {rejectedCompletions.map((completion) => (
                  <Card key={completion.id} className="p-4 bg-red-50 border-red-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Rejected:{" "}
                        {new Date(completion.updated_at).toLocaleDateString()}
                      </p>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Rejected
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
