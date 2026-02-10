export interface User {
  id: string;
  username: string;
  points: number;
  created_at: string;
  email?: string;
}

export interface Task {
  id: string;
  creator_id: string;
  title: string;
  platform: string;
  action_type: string;
  link: string;
  reward: number;
  max_completions: number;
  completed_count: number;
  status: "active" | "paused" | "completed";
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  proof_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface TaskWithCreator extends Task {
  creator?: User;
}

export interface CompletionToken {
  id: string;
  user_id: string;
  task_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface PlatformVerification {
  id: string;
  user_id: string;
  platform: string;
  platform_username: string;
  verification_phrase: string;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Platform =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "reddit"
  | "x"
  | "youtube"
  | "medium"
  | "substack"
  | "threads"
  | "bluesky"
  | "quora"
  | "mastodon"
  | "producthunt";

export type ActionType = "follow" | "subscribe" | "like" | "comment";
