"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createTask, getCurrentUser } from "@/lib/actions";
import { User } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card from "@/components/Card";

const PLATFORMS = [
  "tiktok",
  "instagram",
  "facebook",
  "reddit",
  "x",
  "youtube",
  "medium",
  "substack",
  "threads",
  "bluesky",
  "quora",
  "mastodon",
  "producthunt",
];

const ACTIONS = ["follow", "subscribe", "like", "comment"];

export default function CreateTaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    platform: "tiktok",
    action_type: "follow",
    link: "",
    reward: 10,
    max_completions: 10,
  });

  useEffect(() => {
    async function checkAuth() {
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
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const totalCost = formData.reward * formData.max_completions;
  const userCanAfford = user && user.points >= totalCost;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("User not found");
      return;
    }

    if (!userCanAfford) {
      setError(
        `Insufficient points. You need ${totalCost} points but only have ${user.points}`
      );
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createTask(user.id, {
        title: formData.title,
        platform: formData.platform,
        action_type: formData.action_type,
        link: formData.link,
        reward: formData.reward,
        max_completions: formData.max_completions,
      });

      setSuccess("Task created successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Create a Task</h1>
          <p className="text-gray-600 mb-8">
            Create a promotion task for others to complete and earn points from
            your audience.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <p className="text-gray-600 text-sm mb-1">Your Points</p>
              <p className="text-3xl font-bold text-blue-600">{user.points}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="text-gray-600 text-sm mb-1">Task Cost</p>
              <p className="text-3xl font-bold text-green-600">{totalCost}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <p className="text-gray-600 text-sm mb-1">After Creation</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.max(0, user.points - totalCost)}
              </p>
            </Card>
          </div>

          <Card className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Follow my TikTok account"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clear, concise description of what you want users to do
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Action Type *
                  </label>
                  <select
                    value={formData.action_type}
                    onChange={(e) =>
                      setFormData({ ...formData, action_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {ACTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Link *
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full URL to your profile, video, or post
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Reward per Completion (points) *
                  </label>
                  <input
                    type="number"
                    value={formData.reward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reward: Math.max(1, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Points each person earns for completing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Max Completions *
                  </label>
                  <input
                    type="number"
                    value={formData.max_completions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_completions: Math.max(1, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many people can complete this task
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Total Cost:</strong> {formData.reward} points ×{" "}
                  {formData.max_completions} completions ={" "}
                  <strong className="text-lg">{totalCost} points</strong>
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Points will be deducted from your account when you create this
                  task.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                disabled={!userCanAfford}
                className="w-full"
              >
                {userCanAfford
                  ? `Create Task (-${totalCost} points)`
                  : "Insufficient Points"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
