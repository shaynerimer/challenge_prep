import '@/app/globals.css';

export default function LandingLayout({ children }) {
    return (
        <html lang="en">
            <body className='flex min-h-dvh justify-center bg-base-200'>
                <div className='grow'>
                    { children }
                </div>
            </body>
        </html>
    )
}