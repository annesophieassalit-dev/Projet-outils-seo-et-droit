import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/blog";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `https://www.visibleetconforme.fr/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: "fr_FR",
      publishedTime: post.date,
      authors: ["Anne-Sophie Assalit"],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Anne-Sophie Assalit",
      url: "https://www.visibleetconforme.fr",
    },
    publisher: {
      "@type": "Organization",
      name: "Visible & Conforme",
      url: "https://www.visibleetconforme.fr",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.visibleetconforme.fr/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-gray-100 bg-white/95 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-zen-950">
            Visible &amp; Conforme
          </Link>
          <Link
            href="/inscription"
            className="bg-coral-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-coral-600 transition-colors"
          >
            Démarrer pour 1€
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-zen-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tous les articles
          </Link>
        </nav>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-zen-50 text-zen-700 px-2.5 py-0.5 rounded-full font-medium border border-zen-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Titre */}
        <h1 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-6 leading-snug">
          {post.title}
        </h1>

        {/* Méta */}
        <div className="flex items-center gap-5 text-sm text-gray-400 mb-10 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readingTime} min de lecture
          </span>
          <span>Par Anne-Sophie Assalit</span>
        </div>

        {/* Contenu */}
        <div
          className="prose prose-gray prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-zen-950
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-zen-700 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-zen-950
            prose-ul:space-y-1 prose-li:text-gray-700
            prose-blockquote:border-l-zen-400 prose-blockquote:bg-zen-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA fin d'article */}
        <div className="mt-16 bg-zen-50 border border-zen-200 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1">
              <p className="font-bold text-zen-950 text-lg mb-1">
                Vérifiez vos propres textes
              </p>
              <p className="text-sm text-gray-500">
                Visible &amp; Conforme analyse votre site et signale les formulations à risque, avec
                des suggestions adaptées à votre activité.
              </p>
            </div>
            <Link
              href="/inscription"
              className="shrink-0 bg-coral-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors text-sm whitespace-nowrap"
            >
              Essayer pour 1€
            </Link>
          </div>
        </div>

        {/* Retour au blog */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-gray-400 hover:text-zen-700 transition-colors">
            ← Voir tous les articles
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
            <Link href="/politique-confidentialite" className="hover:text-gray-600">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
