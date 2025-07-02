import '@/app/globals.css';
import AppLayout from "@/components/appLayout";
import StoreProvider from "@/app/storeProvider";

export default function Layout({ children }) {

  return (
    <StoreProvider>
      <AppLayout children={children}/>
    </StoreProvider>
  )
}