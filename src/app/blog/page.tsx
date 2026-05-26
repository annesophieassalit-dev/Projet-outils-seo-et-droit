import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog — Conseils pour praticiens bien-être",
  description: "Conseils pour communiquer sans risque et être visible sur Google quand on est praticien bien-être.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/95 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-zen-950">Visible & Conforme</Link>
          <Link href="/inscription" className="bg-coral-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-coral-600 transition-colors">
            Démarrer pour 1€
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-zen-950 mb-3">Blog</h1>
        <p className="text-gray-500 mb-12">Conseils pour communiquer sans risque et rester visible sur Google.</p>

        {posts.length === 0 && (
          <p className="text-gray-400">Aucun article pour l&apos;instant.</p>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group"
            >
              <p className="text-xs text-gray-400 mb-2">
                {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h2 className="text-lg font-semibold text-zen-950 mb-2 group-hover:text-zen-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{post.description}</p>
              <span className="text-sm text-zen-700 font-medium flex items-center gap-1">
                Lire l&apos;article <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
