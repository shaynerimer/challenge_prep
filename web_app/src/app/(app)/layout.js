import '@/app/globals.css';
import AppLayout from "@/components/appLayout";
import StoreProvider from "@/app/storeProvider";
import { ClerkProvider } from "@clerk/nextjs";

export default function Layout({ children }) {

  return (
    <ClerkProvider>
      <StoreProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </StoreProvider>
    </ClerkProvider>
  )
}