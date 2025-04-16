"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProviderClient } from "../../../locales/client";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  return (
    <SessionProvider>
      {locale ? (
        <I18nProviderClient locale={locale}>{children}</I18nProviderClient>
      ) : (
        children
      )}
    </SessionProvider>
  );
}
