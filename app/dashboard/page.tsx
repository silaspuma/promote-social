"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getUserCreatedTasks,
  getUserTaskCompletions,
} from "@/lib/actions";
import { User, Task, TaskCompletion } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card from "@/components/Card";
import TaskCard from "@/components/TaskCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [_authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        setAuthenticated(true);

        // Fetch user profile
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        let user = userData;
        
        // If user doesn't have a profile yet, create one
        if (!user || fetchError) {
          const defaultUsername = authUser.email?.split('@')[0] || `user_${authUser.id.slice(0, 8)}`;
          console.log("Creating profile for user:", authUser.id, "username:", defaultUsername);
          
          const { error: upsertError } = await supabase.from("users").upsert(
            {
              id: authUser.id,
              username: defaultUsername,
              points: 50,
            },
            { onConflict: "id" }
          );
          
          if (upsertError) {
            console.error("Upsert error:", upsertError?.code, upsertError?.message);
            throw new Error(`Failed to create user profile: ${upsertError?.message}`);
          }
          
          // Add a small delay to ensure data is committed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Fetch the profile
          console.log("Fetching profile after upsert...");
          const { data: newUser, error: refetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();
            
          if (refetchError || !newUser) {
            console.error("Refetch error:", refetchError?.code, refetchError?.message);
            throw new Error("Failed to load user profile after creation");
          }
          user = newUser;
          console.log("Profile loaded successfully:", user.id);
        }

        setUser(user);

        const created = await getUserCreatedTasks(user.id);
        setCreatedTasks(created);

        const completed = await getUserTaskCompletions(user.id);
        setCompletedTasks(completed);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
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
  const pendingCompletions = completedTasks.filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back!</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Points Balance</p>
              <p className="text-3xl font-bold text-blue-600">{user.points}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Tasks Created</p>
              <p className="text-3xl font-bold">{createdTasks.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-green-600">
                {approvedCompletions}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingCompletions}
              </p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Link href="/browse">
              <Button variant="outline" size="lg" className="w-full">
                🎯 Browse Tasks
              </Button>
            </Link>
            <Link href="/create-task">
              <Button size="lg" className="w-full">
                ✨ Create Task
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="lg" className="w-full">
                👤 View Profile
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="space-y-8">
            {/* Created Tasks */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Created Tasks</h2>
              {createdTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">
                    You haven't created any tasks yet.
                  </p>
                  <Link href="/create-task">
                    <Button size="md" className="mt-4">
                      Create Your First Task
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </section>

            {/* Completed Tasks */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Completed Tasks</h2>
              {completedTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No completions yet.</p>
                  <Link href="/browse">
                    <Button size="md" className="mt-4">
                      Browse Available Tasks
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {completedTasks.map((completion) => (
                    <Card key={completion.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">
                            Task ID: {completion.task_id}
                          </p>
                          <p className="font-semibold">
                            Completed: {new Date(completion.created_at).toLocaleDateString()}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
