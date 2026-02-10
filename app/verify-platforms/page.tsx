"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  getUserPlatformVerifications,
  createPlatformVerification,
  verifyPlatformAccount,
} from "@/lib/actions";
import { User, PlatformVerification, Platform } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PlatformIcon from "@/components/PlatformIcon";

const PLATFORMS: Platform[] = [
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

export default function VerifyPlatformsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verifications, setVerifications] = useState<PlatformVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "">("");
  const [platformUsername, setPlatformUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationPhrase, setVerificationPhrase] = useState("");

  useEffect(() => {
    async function loadData() {
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

        const verificationsData = await getUserPlatformVerifications(userData.id);
        setVerifications(verificationsData);

        // Generate verification phrase
        generateVerificationPhrase(userData.username);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function generateVerificationPhrase(username: string) {
    const phrase = `promote.social-${username}-${Math.random().toString(36).slice(2, 8)}`;
    setVerificationPhrase(phrase);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedPlatform) return;

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const verification = await createPlatformVerification(
        user.id,
        selectedPlatform,
        platformUsername,
        verificationPhrase
      );

      if (!verification) {
        throw new Error("Failed to create verification");
      }

      setSuccess(
        `Verification request submitted! Add "${verificationPhrase}" to your ${selectedPlatform} bio and wait for approval.`
      );

      // Reload verifications
      const verificationsData = await getUserPlatformVerifications(user.id);
      setVerifications(verificationsData);

      // Reset form
      setSelectedPlatform("");
      setPlatformUsername("");
      generateVerificationPhrase(user.username);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualVerify(verificationId: string) {
    setSubmitting(true);
    try {
      await verifyPlatformAccount(verificationId);
      setSuccess("Account verified successfully!");

      // Reload verifications
      if (user) {
        const verificationsData = await getUserPlatformVerifications(user.id);
        setVerifications(verificationsData);
      }
    } catch (err: any) {
      setError("Failed to verify account");
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Verify Your Accounts</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Verify your social media accounts to complete tasks and earn points
          </p>

          {/* Verified Accounts */}
          {verifications.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Verifications</h2>
              <div className="space-y-3">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        <PlatformIcon platform={v.platform} className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {v.platform.charAt(0).toUpperCase() + v.platform.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">@{v.platform_username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {v.verified ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1roundedpx-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Verified
                        </span>
                      ) : (
                        <>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                            ⏳ Pending
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleManualVerify(v.id)}
                            disabled={submitting}
                          >
                            Verify Now
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Add New Verification */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Verification</h2>

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
                  Select Platform *
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a platform...</option>
                  {PLATFORMS.map((p) => {
                    const alreadyVerified = verifications.some(
                      (v) => v.platform === p
                    );
                    return (
                      <option key={p} value={p} disabled={alreadyVerified}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                        {alreadyVerified ? " (Already added)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedPlatform && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold mb-3">📋 Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Copy this verification phrase:{" "}
                        <code className="bg-white px-2 py-1 rounded font-mono text-xs">
                          {verificationPhrase}
                        </code>
                      </li>
                      <li>
                        Go to your {selectedPlatform} profile and add it to your
                        bio/about section
                      </li>
                      <li>Enter your username below and submit</li>
                      <li>We'll verify and approve your account shortly</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Your {selectedPlatform} Username *
                    </label>
                    <input
                      type="text"
                      value={platformUsername}
                      onChange={(e) => setPlatformUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your_username"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your username without the @ symbol
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={submitting}
                    disabled={!platformUsername || submitting}
                    className="w-full"
                  >
                    Submit for Verification
                  </Button>
                </>
              )}
            </form>
          </Card>

          <Card className="p-6 mt-6 bg-yellow-50 border-yellow-200">
            <h3 className="font-bold mb-2 text-yellow-900">
              ⚠️ Important Notes
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Keep the verification phrase in your bio until approved</li>
              <li>You can remove it after verification is complete</li>
              <li>Each account can only be verified once per user</li>
              <li>Verification typically takes a few minutes</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
