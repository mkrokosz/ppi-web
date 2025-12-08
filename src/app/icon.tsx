import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 14,
          background: '#1a365d',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ed8936',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          borderRadius: 6,
        }}
      >
        PPI
      </div>
    ),
    {
      ...size,
    }
  )
}
