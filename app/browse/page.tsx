"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/actions";
import { Task } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TaskCard from "@/components/TaskCard";

export default function BrowsePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const platforms = [
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

  const actions = ["follow", "subscribe", "like", "comment"];

  useEffect(() => {
    async function loadTasks() {
      try {
        const filters: any = {};
        if (platformFilter) filters.platform = platformFilter;
        if (actionFilter) filters.action_type = actionFilter;

        const data = await getTasks(filters);
        setTasks(data);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [platformFilter, actionFilter]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Browse Tasks</h1>

          {/* Filters */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Platform
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Platforms</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {actions.map((a) => (
                    <option key={a} value={a}>
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="text-gray-600 mt-4">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">
                No tasks found. Try different filters or check back later!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
