import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { getPageSections, getPublishedPosts } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Conseils beauté',
  description:
    'Conseils et astuces du salon Mawazo Hair & Beauty pour vos cheveux, votre maquillage et vos ongles.',
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function BlogPage() {
  const [posts, { blog_intro: intro }] = await Promise.all([getPublishedPosts(), getPageSections()])
  const [first, ...rest] = posts

  return (
    <>
      <PageHeader title={intro?.title ?? 'Conseils beauté'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        {!first ? (
          <p className="text-ink-soft border-line border p-6 md:p-10">
            Les premiers articles arrivent bientôt.
          </p>
        ) : (
          <>
            <Link
              href={`/blog/${first.slug}`}
              className="group grid gap-8 md:grid-cols-2 md:items-center"
            >
              <PhotoSlot
                src={first.imageUrl}
                alt={first.title}
                brief="illustration de l'article"
                className="aspect-[4/3]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div>
                <p className="text-ink-soft text-sm">
                  {[first.category, dateFormatter.format(new Date(first.publishedAt))]
                    .filter(Boolean)
                    .join(' - ')}
                </p>
                <h2 className="font-display group-hover:text-accent mt-3 text-4xl leading-tight font-medium md:text-5xl">
                  {first.title}
                </h2>
                {first.excerpt && (
                  <p className="text-ink-soft mt-4 max-w-[52ch] text-lg">{first.excerpt}</p>
                )}
              </div>
            </Link>

            {rest.length > 0 && (
              <ul className="mt-20 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.id} data-reveal>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <PhotoSlot
                        src={post.imageUrl}
                        alt={post.title}
                        brief="illustration de l'article"
                        className="aspect-[4/3]"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <p className="text-ink-soft mt-4 text-sm">
                        {dateFormatter.format(new Date(post.publishedAt))}
                      </p>
                      <h3 className="font-display group-hover:text-accent mt-1 text-2xl leading-tight font-semibold">
                        {post.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  )
}
