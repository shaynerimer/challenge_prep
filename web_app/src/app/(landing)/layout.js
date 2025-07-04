import '@/app/globals.css';

export default function LandingLayout({ children }) {
    return (
        <html lang="en">
            <body className='min-h-dvh bg-gray-200'>
                <div className='min-h-dvh'>
                    { children }
                </div>
            </body>
        </html>
    )
}