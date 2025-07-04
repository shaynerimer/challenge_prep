import { SignIn} from '@clerk/nextjs';

export default function LoginPage() {

  return (
    <div className='bg-transparent h-full min-h-dvh w-full flex flex-col flex-1 justify-center items-center'>
      <SignIn />
    </div>
  )
}