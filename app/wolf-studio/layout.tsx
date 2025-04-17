import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WOLF Studio',
  description: 'WOLF Studio - We believe in a world where everyone loves going to work',
}

export default function WolfStudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="wolf-studio-layout">
      {children}
    </div>
  )
} 