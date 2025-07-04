import Logo from '@/assets/sg_heroLogo.svg'
import ArchDiagram from '@/assets/archDiagram.svg'
import Image from 'next/image'
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from 'next/link';

export default function LandingPage() {
    
    return (
        <div className='bg-transparent min-h-dvh w-full flex flex-col justify-center items-center'>

            {/* Scroll Section 1 - Hero Logo, Title, and Log-in Invitation */}
            <div className='flex flex-row gap-10 justify-around items-center min-h-dvh w-full p-25'>
                <div>
                    <Image src={Logo} alt="Brand Logo" className="h-120 w-auto" />
                </div>
                
                <div className='flex flex-col gap-20 justify-center items-center'>
                    <div className='text-gray-800 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold xl:text-left lg:text-center md:text-center sm:text-center mb-4'>
                       <h1>A Witty Demonstraion of<br /></h1>
                       <h1 className='lg:indent-10 text-xl sm:text-3xl md:text-4xl lg:text-5xl'>A <span className='font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl'>Seriously</span> Good Architecture</h1>
                    </div>

                    <SignedOut>
                    <Link href='/login' className='btn btn-primary text-lg px-8 py-4'>
                        Log In
                    </Link> 
                    </SignedOut>

                    <SignedIn>
                        <Link href='/app' className='btn btn-primary text-lg px-8 py-4'>
                            Welcome Back
                        </Link>
                    </SignedIn>
                </div>
            </div>

            {/* Scroll Section 2 - Architecture Diagram */}
            <div className='min-h-dvh w-full bg-base-100 flex justify-center items-center p-35'>
                <Image src={ArchDiagram} alt="Architecture Diagram" className="w-full h-auto" />
            </div>

        </div>
    )
}