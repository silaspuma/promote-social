"use server";

import { supabase } from "./supabase";
import { User, Task, TaskCompletion, CompletionToken, PlatformVerification } from "./types";

// User actions
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user:", error?.code, error?.message);
    return null;
  }

  return data || null;
}

export async function getUserByIdDirect(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user by id:", error?.code, error?.message);
    return null;
  }

  return data || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateUserPoints(
  userId: string,
  pointsChange: number
): Promise<User | null> {
  // First get current points
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    return null;
  }

  const newPoints = Math.max(0, currentUser.points + pointsChange);

  const { data, error } = await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user points:", error);
    return null;
  }

  return data;
}

// Task actions
export async function createTask(
  creatorId: string,
  taskData: {
    title: string;
    platform: string;
    action_type: string;
    link: string;
    reward: number;
    max_completions: number;
  }
): Promise<Task | null> {
  const cost = taskData.reward * taskData.max_completions;

  // Check if user has enough points
  const user = await getUserById(creatorId);
  if (!user || user.points < cost) {
    throw new Error("Insufficient points");
  }

  // Create task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      creator_id: creatorId,
      ...taskData,
    })
    .select()
    .single();

  if (taskError) {
    console.error("Error creating task:", taskError);
    throw taskError;
  }

  // Deduct points from user
  await supabase
    .from("users")
    .update({ points: user.points - cost })
    .eq("id", creatorId);

  return task;
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getTasks(filters?: {
  platform?: string;
  action_type?: string;
  status?: string;
  minReward?: number;
  maxReward?: number;
}): Promise<Task[]> {
  let query = supabase.from("tasks").select("*");

  if (filters?.platform) {
    query = query.eq("platform", filters.platform);
  }

  if (filters?.action_type) {
    query = query.eq("action_type", filters.action_type);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.minReward) {
    query = query.gte("reward", filters.minReward);
  }

  if (filters?.maxReward) {
    query = query.lte("reward", filters.maxReward);
  }

  const { data, error } = await query
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

export async function getUserCreatedTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }

  return data || [];
}

export async function updateTaskStatus(
  taskId: string,
  status: "active" | "paused" | "completed"
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task status:", error);
    return null;
  }

  return data;
}

// Task completion actions
export async function createTaskCompletion(
  taskId: string,
  userId: string,
  proofUrl?: string,
  token?: string
): Promise<TaskCompletion | null> {
  // Validate completion token if provided
  if (token) {
    const isValid = await validateCompletionToken(userId, taskId, token);
    if (!isValid) {
      throw new Error("Invalid or expired completion token");
    }
  } else {
    throw new Error("Completion token is required");
  }

  // Check task completion requirements
  const task = await getTask(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const requirements = await checkTaskCompletionRequirements(
    userId,
    taskId,
    task.platform
  );
  if (!requirements.canComplete) {
    throw new Error(
      `Cannot complete task: ${requirements.reasons.join(", ")}`
    );
  }

  const { data, error } = await supabase
    .from("task_completions")
    .insert({
      task_id: taskId,
      user_id: userId,
      proof_url: proofUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task completion:", error);
    throw error;
  }

  return data;
}

export async function getTaskCompletion(
  completionId: string
): Promise<TaskCompletion | null> {
  const { data, error } = await supabase
    .from("task_completions")
    .select("*")
    .eq("id", completionId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getTaskCompletions(
  taskId: string,
  status?: string
): Promise<TaskCompletion[]> {
  let query = supabase
    .from("task_completions")
    .select("*")
    .eq("task_id", taskId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching task completions:", error);
    return [];
  }

  return data || [];
}

export async function getUserTaskCompletions(
  userId: string
): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from("task_completions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user completions:", error);
    return [];
  }

  return data || [];
}

export async function approveTaskCompletion(
  completionId: string
): Promise<boolean> {
  const completion = await getTaskCompletion(completionId);
  if (!completion) {
    throw new Error("Completion not found");
  }

  const task = await getTask(completion.task_id);
  if (!task) {
    throw new Error("Task not found");
  }

  // Check if task creator is the one approving
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== task.creator_id) {
    throw new Error("Unauthorized");
  }

  // Update completion status
  const { error: updateError } = await supabase
    .from("task_completions")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", completionId);

  if (updateError) {
    throw updateError;
  }

  // Award points to completer
  const completerUser = await getUserById(completion.user_id);
  if (completerUser) {
    await supabase
      .from("users")
      .update({ points: completerUser.points + task.reward })
      .eq("id", completion.user_id);
  }

  // Update completed count and check if task is complete
  const newCompletedCount = task.completed_count + 1;
  const newStatus =
    newCompletedCount >= task.max_completions ? "completed" : "active";

  await supabase
    .from("tasks")
    .update({
      completed_count: newCompletedCount,
      status: newStatus,
    })
    .eq("id", task.id);

  return true;
}

export async function rejectTaskCompletion(
  completionId: string
): Promise<boolean> {
  const completion = await getTaskCompletion(completionId);
  if (!completion) {
    throw new Error("Completion not found");
  }

  const task = await getTask(completion.task_id);
  if (!task) {
    throw new Error("Task not found");
  }

  // Check if task creator is the one rejecting
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== task.creator_id) {
    throw new Error("Unauthorized");
  }

  // Update completion status
  const { error } = await supabase
    .from("task_completions")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", completionId);

  if (error) {
    throw error;
  }

  return true;
}

// Extension token functions
export async function validateCompletionToken(
  taskId: string,
  userId: string,
  token: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("completion_tokens")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .eq("token", token)
    .eq("used", false)
    .single();

  if (error || !data) {
    return false;
  }

  // Check if token is expired
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    return false;
  }

  // Mark token as used
  await supabase
    .from("completion_tokens")
    .update({ used: true })
    .eq("id", data.id);

  return true;
}

export async function createCompletionToken(
  taskId: string,
  userId: string,
  token: string
): Promise<CompletionToken | null> {
  // Token expires in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const { data, error } = await supabase
    .from("completion_tokens")
    .insert({
      task_id: taskId,
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating token:", error);
    return null;
  }

  return data;
}

// Platform verification functions
export async function createPlatformVerification(
  userId: string,
  platform: string,
  platformUsername: string,
  verificationPhrase: string
): Promise<PlatformVerification | null> {
  const { data, error } = await supabase
    .from("platform_verifications")
    .insert({
      user_id: userId,
      platform,
      platform_username: platformUsername,
      verification_phrase: verificationPhrase,
      verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating verification:", error);
    return null;
  }

  return data;
}

export async function getPlatformVerification(
  userId: string,
  platform: string
): Promise<PlatformVerification | null> {
  const { data, error } = await supabase
    .from("platform_verifications")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", platform)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getUserPlatformVerifications(
  userId: string
): Promise<PlatformVerification[]> {
  const { data, error } = await supabase
    .from("platform_verifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching verifications:", error);
    return [];
  }

  return data || [];
}

export async function verifyPlatformAccount(
  verificationId: string
): Promise<boolean> {
  // In production, you would make API calls to each platform to check the bio
  // For now, we'll mark it as verified (manual approval or mock verification)
  
  const { error } = await supabase
    .from("platform_verifications")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  if (error) {
    console.error("Error verifying platform:", error);
    return false;
  }

  return true;
}

export async function checkTaskCompletionRequirements(
  userId: string,
  _taskId: string,
  platform: string
): Promise<{
  canComplete: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  // Check if user has verified account for this platform
  const verification = await getPlatformVerification(userId, platform);
  
  if (!verification) {
    reasons.push(`You must verify your ${platform} account first`);
  } else if (!verification.verified) {
    reasons.push(`Your ${platform} account verification is pending`);
  }

  // Check if user has extension installed (checked client-side)
  // This is validated by the presence of a valid token

  const canComplete = reasons.length === 0;

  return { canComplete, reasons };
}
