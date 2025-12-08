import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          background: '#1a365d',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ed8936',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          borderRadius: 32,
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
