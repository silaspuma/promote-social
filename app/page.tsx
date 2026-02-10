import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import PlatformIcon from "@/components/PlatformIcon";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Promote your content.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Earn points by supporting others.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join a community of creators helping each other grow. Complete
              tasks like following, subscribing, liking, and commenting to earn
              points. Spend points to create tasks for others to complete.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
              <Link href="/auth/signup" className="flex">
                <Button size="lg" className="w-full">Get started</Button>
              </Link>
              <Link href="/browse" className="flex">
                <Button size="lg" variant="outline" className="w-full">
                  Browse tasks
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center">How it works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Browse tasks</h3>
                <p className="text-gray-600">
                  Explore tasks from creators across multiple platforms like
                  TikTok, Instagram, YouTube, and more.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Complete tasks</h3>
                <p className="text-gray-600">
                  Follow, subscribe, like, or comment. You'll automatically earn points after completing a task!
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create tasks</h3>
                <p className="text-gray-600">
                  Spend your earned points to create promotion tasks and grow
                  your own audience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Platforms */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Supported platforms
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "TikTok", id: "tiktok" },
                { name: "Instagram", id: "instagram" },
                { name: "Facebook", id: "facebook" },
                { name: "Reddit", id: "reddit" },
                { name: "X (Twitter)", id: "x" },
                { name: "YouTube", id: "youtube" },
                { name: "Medium", id: "medium" },
                { name: "Substack", id: "substack" },
                { name: "Threads", id: "threads" },
                { name: "Bluesky", id: "bluesky" },
                { name: "Quora", id: "quora" },
                { name: "Mastodon", id: "mastodon" },
                { name: "ProductHunt", id: "producthunt" },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-blue-400 transition"
                >
                  <div className="flex justify-center mb-2 text-blue-600">
                    <PlatformIcon platform={platform.id} className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-medium">{platform.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Actions */}
        <section className="py-20 px-4 bg-white"> 
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Supported actions
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Follow", description: "Follow creators on their platform", emoji: "👥" },
                { title: "Subscribe", description: "Subscribe to channels and newsletters", emoji: "🔔" },
                { title: "Like", description: "Like posts, videos, and content", emoji: "❤️" },
                { title: "Comment", description: "Leave meaningful comments", emoji: "💬" },
              ].map((action) => (
                <div
                  key={action.title}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200"
                >
                  <div className="text-4xl mb-3">{action.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to grow your audience?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of creators earning points and supporting each
              other.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Get started now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
