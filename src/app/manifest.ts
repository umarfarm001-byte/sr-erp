import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SR Footwear ERP',
    short_name: 'SR ERP',
    description: 'Internal Factory Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/window.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/window.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
