import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/data/public'

// Aperçu affiché quand un lien du site est partagé sur WhatsApp (1200 x 630 obligatoire).
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Mawazo Hair & Beauty, salon de coiffure et de beauté à Kinshasa'

export default async function OpenGraphImage() {
  const settings = await getSiteSettings()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#f4ece3',
        color: '#2b1b15',
        fontFamily: 'serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 120, lineHeight: 1 }}>Mawazo</div>
        <div style={{ fontSize: 30, letterSpacing: 10, marginTop: 12, color: '#5e4a40' }}>
          HAIR &amp; BEAUTY
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 44, color: '#6d1f2f' }}>{settings.tagline ?? ''}</div>
        <div style={{ fontSize: 30, marginTop: 16, color: '#5e4a40' }}>
          {settings.address ?? ''}
        </div>
      </div>
    </div>,
    size,
  )
}
