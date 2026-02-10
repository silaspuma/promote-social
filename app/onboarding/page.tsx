"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { checkExtensionInstalled } from "@/lib/extension";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  const handleCheckExtension = async () => {
    setChecking(true);
    const installed = await checkExtensionInstalled();
    setExtensionInstalled(installed);
    setChecking(false);

    if (installed) {
      setCurrentStep(3);
    }
  };

  const handleComplete = () => {
    if (authenticated) {
      router.push("/verify-platforms");
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Get Started</h1>
            <p className="text-xl text-gray-600">
              Follow these steps to complete tasks and earn points
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                } font-bold`}
              >
                1
              </div>
              <div className="w-20 h-1 bg-gray-300">
                <div
                  className={`h-full ${currentStep >= 2 ? "bg-blue-600" : ""}`}
                />
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                } font-bold`}
              >
                2
              </div>
              <div className="w-20 h-1 bg-gray-300">
                <div
                  className={`h-full ${currentStep >= 3 ? "bg-blue-600" : ""}`}
                />
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                } font-bold`}
              >
                3
              </div>
            </div>
          </div>

          {/* Step 1: Download Extension */}
          {currentStep === 1 && (
            <Card className="p-8 mb-6 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="text-6xl">🔌</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">
                    Step 1: Install the Extension
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    Our Chrome extension verifies that you've completed tasks and
                    securely sends proof to our servers. This prevents fraud and
                    ensures everyone plays fair.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-3">
                      📥 Installation Instructions
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Download the extension from the links below</li>
                      <li>Open Chrome and go to chrome://extensions/</li>
                      <li>Enable "Developer mode" (toggle in top right)</li>
                      <li>Click "Load unpacked"</li>
                      <li>Select the downloaded chrome-extension folder</li>
                      <li>Extension icon should appear in your toolbar</li>
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <a
                      href="/chrome-extension.zip"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      download
                    >
                      📦 Download Extension
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      I've Installed It →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Verify Installation */}
          {currentStep === 2 && (
            <Card className="p-8 mb-6 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="text-6xl">✅</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">
                    Step 2: Verify Installation
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    Let's check that the extension is properly installed and
                    communicating with the website.
                  </p>

                  {extensionInstalled ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">✅</span>
                        <h3 className="font-bold text-lg text-green-800">
                          Extension Detected!
                        </h3>
                      </div>
                      <p className="text-green-700">
                        The extension is installed and working correctly. You're
                        ready to continue!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">⚠️</span>
                        <h3 className="font-bold text-lg text-yellow-800">
                          Extension Not Detected
                        </h3>
                      </div>
                      <p className="text-yellow-700 mb-4">
                        We couldn't detect the extension. Make sure it's installed
                        and enabled in chrome://extensions/
                      </p>
                      <p className="text-sm text-yellow-600">
                        After installing, refresh this page and try again.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={handleCheckExtension}
                      loading={checking}
                      disabled={checking}
                    >
                      {extensionInstalled ? "Check Again" : "Check Extension"}
                    </Button>
                    {extensionInstalled && (
                      <Button onClick={() => setCurrentStep(3)}>
                        Continue →
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      ← Back
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Ready to Go */}
          {currentStep === 3 && (
            <Card className="p-8 mb-6 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="text-6xl">🎉</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">
                    Step 3: Verify Your Accounts
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    Before completing tasks, you need to verify your social media
                    accounts. This ensures authenticity and prevents abuse.
                  </p>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-3">
                      🔐 Account Verification
                    </h3>
                    <p className="text-gray-700 mb-4">
                      For each platform you want to complete tasks on:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>We'll give you a unique verification phrase</li>
                      <li>Add it to your bio/about section on that platform</li>
                      <li>Submit your username for verification</li>
                      <li>We'll check your bio and approve your account</li>
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleComplete}>
                      {authenticated ? "Verify My Accounts" : "Sign Up to Continue"}
                    </Button>
                    <Link href="/browse">
                      <Button variant="outline">Skip for Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-bold mb-2">Secure & Safe</h3>
              <p className="text-sm text-gray-600">
                Our extension uses encrypted tokens and never accesses personal
                data
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Fast & Easy</h3>
              <p className="text-sm text-gray-600">
                Complete tasks in seconds and earn points automatically
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold mb-2">Fair Play</h3>
              <p className="text-sm text-gray-600">
                Verification prevents fraud and ensures everyone gets rewarded
                fairly
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
