import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";

export const metadata: Metadata = {
  title: "Blog — Conseils SEO et conformité pour praticiens bien-être",
  description:
    "Articles pratiques pour aider les sophrologues, naturopathes et thérapeutes à communiquer sans risque juridique et être visibles sur Google.",
  alternates: { canonical: "https://www.visibleetconforme.fr/blog" },
  openGraph: {
    title: "Blog Visible & Conforme — SEO et conformité pour praticiens bien-être",
    description:
      "Articles pratiques pour aider les sophrologues, naturopathes et thérapeutes à communiquer sans risque juridique.",
    url: "https://www.visibleetconforme.fr/blog",
    type: "website",
    locale: "fr_FR",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-white">
      <BlogHeader />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block bg-zen-50 text-zen-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Blog
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-zen-950 mb-4">
            Communiquer sans risque,<br className="hidden sm:block" /> être visible sur Google
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Guides pratiques pour les sophrologues, naturopathes et praticiens bien-être qui veulent
            développer leur activité en toute conformité.
          </p>
        </div>

        {posts.length === 0 && (
          <p className="text-center text-gray-400">Aucun article pour l&apos;instant.</p>
        )}

        {/* Article à la une */}
        {featured && (
          <div className="mb-12">
            <p className="text-xs font-semibold text-zen-700 uppercase tracking-wide mb-4">
              À la une
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block bg-zen-50 border border-zen-200 rounded-2xl p-8 hover:shadow-lg transition-all"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-zen-100 text-zen-700 px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zen-950 mb-3 group-hover:text-zen-700 transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-gray-500 mb-5 text-base max-w-2xl">{featured.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{formatDate(featured.date)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readingTime} min de lecture
                  </span>
                </div>
                <span className="text-sm text-zen-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lire l&apos;article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Grille des autres articles */}
        {rest.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zen-700 uppercase tracking-wide mb-4">
              Tous les articles
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-zen-200 transition-all"
                >
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-semibold text-zen-950 mb-2 group-hover:text-zen-700 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(post.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min
                      </span>
                    </div>
                    <span className="text-xs text-zen-700 font-medium flex items-center gap-1">
                      Lire <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA abonnement */}
        <div className="mt-20 bg-zen-950 rounded-2xl p-10 text-center">
          <p className="text-white font-bold text-xl mb-2">
            Vérifiez vos textes en 2 minutes
          </p>
          <p className="text-zen-200 text-sm mb-6 max-w-md mx-auto">
            Visible &amp; Conforme analyse votre site et signale les formulations à risque, avec des
            suggestions adaptées à votre activité.
          </p>
          <Link
            href="/inscription"
            className="inline-block bg-coral-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors text-sm"
          >
            Essayer pour 1€
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Visible &amp; Conforme</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-gray-600">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-600">
              Confidentialité
            </Link>
            <Link href="/cgv" className="hover:text-gray-600">
              CGV
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
