import '@/app/globals.css';
import { ClerkProvider } from "@clerk/nextjs";

export default function LandingLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className='min-h-dvh bg-gray-200'>
                    <div className='min-h-dvh'>
                        { children }
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
}