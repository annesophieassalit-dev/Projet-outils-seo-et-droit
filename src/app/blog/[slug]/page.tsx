import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

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

      <main className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Tous les articles
        </Link>

        <p className="text-xs text-gray-400 mb-3">
          {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-10 leading-snug">{post.title}</h1>

        <div
          className="prose prose-gray prose-headings:font-bold prose-headings:text-zen-950 prose-a:text-zen-700 prose-a:no-underline hover:prose-a:underline max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 bg-zen-50 border border-zen-200 rounded-2xl p-8 text-center">
          <p className="font-semibold text-zen-950 mb-2">Vérifiez vos propres textes</p>
          <p className="text-sm text-gray-500 mb-5">Visible & Conforme analyse votre site et signale les formulations à risque.</p>
          <Link href="/inscription" className="bg-coral-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors text-sm inline-block">
            Essayer pour 1€
          </Link>
        </div>
      </main>
    </div>
  );
}
