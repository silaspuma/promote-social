"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getTask,
  getUserById,
  createTaskCompletion,
  getUserTaskCompletions,
  checkTaskCompletionRequirements,
} from "@/lib/actions";
import { Task, TaskCompletion, User } from "@/lib/types";
import { checkExtensionInstalled, requestCompletionToken } from "@/lib/extension";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [_proof, setProof] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>("");
  const [userCompletion, setUserCompletion] = useState<TaskCompletion | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [canComplete, setCanComplete] = useState(true);
  const [completionReasons, setCompletionReasons] = useState<string[]>([]);
  const [_completionToken, setCompletionToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      try {
        const taskData = await getTask(taskId);
        if (!taskData) {
          setError("Task not found");
          return;
        }

        setTask(taskData);

        const creatorData = await getUserById(taskData.creator_id);
        setCreator(creatorData);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const userData = await getUserById(user.id);
          setCurrentUser(userData);

          // Check if user already completed this task
          const completions = await getUserTaskCompletions(user.id);
          const existingCompletion = completions.find(
            (c) => c.task_id === taskId
          );
          if (existingCompletion) {
            setUserCompletion(existingCompletion);
          }

          // Check extension installation
          const installed = await checkExtensionInstalled();
          setExtensionInstalled(installed);

          // Check completion requirements
          const requirements = await checkTaskCompletionRequirements(
            user.id,
            taskId,
            taskData.platform
          );
          setCanComplete(requirements.canComplete);
          setCompletionReasons(requirements.reasons);
        }
      } catch (error) {
        console.error("Error loading task:", error);
        setError("Error loading task");
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${taskId}/${currentUser?.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("task-proofs")
        .upload(fileName, file);

      if (error) throw error;

      setProof(file);
      setProofUrl(data.path);
      setError("");
    } catch (err: any) {
      setError("Failed to upload proof: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!currentUser || !task) {
      setError("User or task not found");
      return;
    }

    if (!proofUrl) {
      setError("Please upload proof before submitting");
      return;
    }

    if (currentUser.id === task.creator_id) {
      setError("You cannot complete your own tasks");
      return;
    }

    // Check if extension is installed
    if (!extensionInstalled) {
      setError(
        "Please install the Promote.Social extension to complete tasks. Visit the Onboarding page for instructions."
      );
      return;
    }

    // Check if user can complete (platform verified, etc.)
    if (!canComplete) {
      setError(
        `Cannot complete task: ${completionReasons.join(", ")}. Please verify your ${task.platform} account first.`
      );
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      // Request completion token from extension
      setSuccess("Requesting verification token from extension...");
      const tokenResponse = await requestCompletionToken(taskId, currentUser.id);
      
      if (!tokenResponse.success || !tokenResponse.token) {
        throw new Error(tokenResponse.error || "Failed to get verification token from extension");
      }

      setCompletionToken(tokenResponse.token);
      setSuccess("Token received! Submitting completion...");

      // Submit completion with token
      await createTaskCompletion(taskId, currentUser.id, proofUrl, tokenResponse.token);
      setSuccess("Task completion submitted! Awaiting approval from the creator.");
      setProof(null);
      setProofUrl("");
      setCompletionToken(null);

      // Reload completion status
      const completions = await getUserTaskCompletions(currentUser.id);
      const existingCompletion = completions.find((c) => c.task_id === taskId);
      if (existingCompletion) {
        setUserCompletion(existingCompletion);
      }
    } catch (err: any) {
      setError("Failed to submit completion: " + err.message);
      setCompletionToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLink = () => {
    if (task?.link) {
      window.open(task.link, "_blank");
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

  if (!task) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const remainingCompletions = task.max_completions - task.completed_count;
  const isCompleted = remainingCompletions <= 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2">
              <Card className="p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
                    {creator && (
                      <p className="text-gray-600">by @{creator.username}</p>
                    )}
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-2xl font-bold">
                    +{task.reward} pts
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {task.platform}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {task.action_type}
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold mb-2">Progress</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {task.completed_count} of {task.max_completions} completed
                    </span>
                    <span
                      className={
                        isCompleted
                          ? "text-sm font-semibold text-red-600"
                          : "text-sm font-semibold text-green-600"
                      }
                    >
                      {remainingCompletions > 0
                        ? `${remainingCompletions} remaining`
                        : "Task Completed"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                      style={{
                        width: `${(task.completed_count / task.max_completions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleOpenLink}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition mb-4"
                >
                  Open Link in New Tab
                </button>
              </Card>

              {/* Completion Form */}
              {!userCompletion && !isCompleted && currentUser && (
                <>
                  {/* Extension & Verification Status */}
                  {!extensionInstalled && (
                    <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
                      <div className="flex items-start gap-3">
                        <div className="text-yellow-600 text-2xl">⚠️</div>
                        <div>
                          <h3 className="font-bold text-yellow-800 mb-2">
                            Extension Required
                          </h3>
                          <p className="text-yellow-700 mb-3">
                            You need to install the Promote.Social Chrome Extension
                            to complete tasks and earn rewards.
                          </p>
                          <Link href="/onboarding">
                            <Button size="sm" variant="secondary">
                              Install Extension
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  )}

                  {extensionInstalled && !canComplete && (
                    <Card className="p-6 mb-6 bg-orange-50 border-orange-200">
                      <div className="flex items-start gap-3">
                        <div className="text-orange-600 text-2xl">🔒</div>
                        <div>
                          <h3 className="font-bold text-orange-800 mb-2">
                            Platform Verification Required
                          </h3>
                          <p className="text-orange-700 mb-2">
                            To complete this {task.platform} task, you need to verify
                            your account:
                          </p>
                          <ul className="list-disc list-inside text-orange-700 mb-3">
                            {completionReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                          <Link href="/verify-platforms">
                            <Button size="sm" variant="secondary">
                              Verify {task.platform} Account
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  )}

                  {extensionInstalled && canComplete && (
                    <Card className="p-6 mb-6 bg-green-50 border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600 text-2xl">✓</div>
                        <div>
                          <h3 className="font-bold text-green-800 mb-1">
                            Ready to Complete
                          </h3>
                          <p className="text-green-700">
                            Extension installed and {task.platform} account verified.
                            You can now complete this task!
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Card className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Submit Completion</h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                      {success}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Upload Proof (Screenshot or Profile Link)
                    </label>
                    <input
                      type="file"
                      onChange={handleProofUpload}
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      disabled={submitting}
                    />
                    {proofUrl && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Proof uploaded successfully
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleCompleteTask}
                    size="lg"
                    loading={submitting}
                    disabled={!proofUrl || !extensionInstalled || !canComplete}
                    className="w-full"
                  >
                    {!extensionInstalled
                      ? "Install Extension First"
                      : !canComplete
                        ? "Verify Platform Account First"
                        : "Submit Completion"}
                  </Button>
                </Card>
                </>
              )}

              {userCompletion && (
                <Card className="p-8 bg-blue-50 border-blue-200">
                  <h2 className="text-lg font-bold mb-2">Completion Status</h2>
                  <p className="text-gray-700">
                    Status:{" "}
                    <span
                      className={
                        userCompletion.status === "pending"
                          ? "font-semibold text-yellow-600"
                          : userCompletion.status === "approved"
                            ? "font-semibold text-green-600"
                            : "font-semibold text-red-600"
                      }
                    >
                      {userCompletion.status.charAt(0).toUpperCase() +
                        userCompletion.status.slice(1)}
                    </span>
                  </p>
                  {userCompletion.status === "approved" && (
                    <p className="text-green-600 mt-2">
                      ✓ You received {task.reward} points!
                    </p>
                  )}
                </Card>
              )}

              {isCompleted && (
                <Card className="p-8 bg-gray-100 border-gray-300">
                  <p className="text-gray-700 font-semibold">
                    This task has been completed and is no longer available.
                  </p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Card className="p-6">
                <h3 className="font-bold mb-4">Task Info</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-600">Reward per completion</p>
                    <p className="font-bold text-lg">{task.reward} points</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total budget</p>
                    <p className="font-bold">
                      {task.reward * task.max_completions} points
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-bold">
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {currentUser && currentUser.id === task.creator_id && (
                  <div className="mt-6 pt-6 border-t">
                    <Link href={`/tasks/${taskId}/manage`} className="block">
                      <Button size="sm" variant="secondary" className="w-full">
                        📋 Manage Completions
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
