import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { SimpleMarkdown } from '@/components/public/SimpleMarkdown'
import { getPostBySlug, getPublishedPosts } from '@/lib/data/public'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getPublishedPosts()).map((p) => p.slug))
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug)
  if (!post) return {}
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  }
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

async function Article({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const post = await getPostBySlug((await params).slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-[1320px] px-4 pt-8 pb-24 md:px-8">
      <Link
        href="/blog"
        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Tous les articles
      </Link>
      <header className="mx-auto mt-8 max-w-3xl">
        <p className="text-ink-soft text-sm">
          {[
            post.category,
            dateFormatter.format(new Date(post.publishedAt)),
            post.readingMinutes ? `${post.readingMinutes} min de lecture` : null,
          ]
            .filter(Boolean)
            .join(' - ')}
        </p>
        <h1 className="rise font-display mt-4 pb-1 text-5xl leading-[1.04] font-medium tracking-tight md:text-6xl">
          {post.title}
        </h1>
        {post.excerpt && <p className="text-ink-soft mt-6 text-xl">{post.excerpt}</p>}
      </header>
      {post.imageUrl && (
        <PhotoSlot
          src={post.imageUrl}
          alt={post.title}
          brief=""
          className="mx-auto mt-12 aspect-[16/9] max-w-5xl"
          sizes="(min-width: 1024px) 1024px, 100vw"
          priority
        />
      )}
      <div className="mx-auto mt-12 max-w-[68ch]">
        {post.content && <SimpleMarkdown text={post.content} />}
        <ButtonLink href="/reservation" className="mt-14">
          Prendre rendez-vous
        </ButtonLink>
      </div>
    </article>
  )
}

export default function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <Article params={params} />
    </Suspense>
  )
}
