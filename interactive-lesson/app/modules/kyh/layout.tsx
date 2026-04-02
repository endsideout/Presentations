"use client";

import { Suspense } from "react";

export default function KYHLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}
