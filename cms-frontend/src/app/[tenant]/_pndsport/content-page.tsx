import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getWebContentByLegacyPath, prepareContentHtml } from '../../../lib/content'
import { Breadcrumbs, QuoteBand } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { PndShell } from './shell'

function legacyPath(segments: string[]) {
  return `/${segments.join('/')}/`
}

export async function getPndContentMetadata(segments: string[]): Promise<Metadata> {
  const content = await getWebContentByLegacyPath(legacyPath(segments))
  if (!content) return { title: 'Không tìm thấy nội dung' }
  const description = content.excerpt || `Thông tin ${content.title} từ PND Sport Việt Nam.`
  return { title: content.title, description, alternates: { canonical: legacyPath(segments) }, openGraph: { title: content.title, description, url: legacyPath(segments) } }
}

export async function PndContentPage({ segments }: { segments: string[] }) {
  const content = await getWebContentByLegacyPath(legacyPath(segments))
  if (!content) notFound()
  return <PndShell>
    <Breadcrumbs base="" items={[{ label: content.title }]} />
    <div className={styles.articleLayout}><article className={styles.article}><span>PND Sport Việt Nam</span><h1>{content.title}</h1>{content.excerpt ? <p className={styles.articleLead}>{content.excerpt}</p> : null}{content.contentHtml ? <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: prepareContentHtml(content.contentHtml) || '' }} /> : null}<QuoteBand compact /></article></div>
  </PndShell>
}
