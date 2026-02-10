export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">About</h3>
            <p className="text-sm text-gray-400">
              promote.social helps creators grow their audience by connecting
              them with supporters.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-400 text-center">
            promote.social is not affiliated with, endorsed by, or officially
            connected to TikTok, Instagram, Facebook, Reddit, X, YouTube,
            Medium, Substack, Threads, Bluesky, Quora, Mastodon, or Product
            Hunt. We provide a platform for creators to help grow their
            audience.
          </p>
          <p className="text-xs text-gray-500 text-center mt-4">
            © 2024 promote.social. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
