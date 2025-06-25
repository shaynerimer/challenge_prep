import '@/app/globals.css';

export default function LandingLayout({ children }) {
    return (
        <html lang="en">
            <body className='flex min-h-dvh justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-300'>
                <div className='grow'>
                    { children }
                </div>
            </body>
        </html>
    )
}