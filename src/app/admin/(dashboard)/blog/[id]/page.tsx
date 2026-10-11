import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { toKinshasaLocal } from '@/lib/admin/kinshasa-time'
import { requireUser } from '@/lib/auth/session'
import { deletePost, savePost } from '../actions'

const FORMAT_HELP =
  'Une ligne vide entre deux paragraphes. « ## » au début d’une ligne pour un titre, « - » pour une liste, **gras**, *italique*.'

/** /admin/blog/nouveau ou /admin/blog/<id> */
export default async function PostPage({ params }: PageProps<'/admin/blog/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [post] = isNew
    ? [undefined]
    : await getDb().select().from(schema.posts).where(eq(schema.posts.id, id))
  if (!isNew && !post) notFound()

  return (
    <AdminPage
      title={post?.title ?? 'Nouvel article'}
      back={{ href: '/admin/blog', label: 'Blog' }}
    >
      {post?.publishedAt && (
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="text-accent mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Voir sur le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      )}
      <AdminForm
        action={savePost.bind(null, post?.id ?? null)}
        submitLabel={post ? 'Enregistrer' : 'Créer l’article'}
        redirectBase={`/admin/blog`}
      >
        <FormSection title="Publication">
          <ToggleField
            name="published"
            label="Publier"
            description="Décoché : l'article reste en brouillon, invisible sur le site."
            defaultChecked={Boolean(post?.publishedAt)}
          />
          <TextField
            name="publishedAt"
            label="Date de publication"
            type="datetime-local"
            defaultValue={toKinshasaLocal(post?.publishedAt)}
            hint="Vide = maintenant. Une date future programme la publication."
          />
        </FormSection>
        <FormSection title="Article">
          <TextField name="title" label="Titre" defaultValue={post?.title} />
          <TextAreaField name="excerpt" label="Résumé" defaultValue={post?.excerpt} rows={2} />
          <ImageField
            name="imageUrl"
            label="Image"
            defaultValue={post?.imageUrl}
            aspect="aspect-[4/3]"
          />
          <TextAreaField
            name="content"
            label="Texte"
            defaultValue={post?.content}
            rows={14}
            hint={FORMAT_HELP}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="category"
              label="Rubrique"
              defaultValue={post?.category}
              hint="Ex. « Soins capillaires »"
            />
            <TextField
              name="readingMinutes"
              label="Temps de lecture (minutes)"
              inputMode="numeric"
              defaultValue={post?.readingMinutes}
            />
          </div>
        </FormSection>
        <FormSection title="Référencement Google (facultatif)">
          <TextField name="seoTitle" label="Titre pour Google" defaultValue={post?.seoTitle} />
          <TextAreaField
            name="seoDescription"
            label="Description pour Google"
            defaultValue={post?.seoDescription}
            rows={2}
          />
        </FormSection>
      </AdminForm>
      {post && (
        <DeleteButton
          action={deletePost.bind(null, post.id)}
          redirectTo="/admin/blog"
          label="Supprimer l'article"
        />
      )}
    </AdminPage>
  )
}
