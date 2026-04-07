import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
//redirect to dashboard 