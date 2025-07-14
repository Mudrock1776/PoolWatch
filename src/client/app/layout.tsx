import React from "react";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PoolWatch',
  description: 'Web tool for managing PoolWatch monitoring systems',
}

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
