import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the memes page which contains our viral meme app
    router.push('/memes?source=realtime');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
        <h1 className="text-4xl font-bold mb-2">🔥 MemeViral 🔥</h1>
        <p className="text-xl">Loading your viral memes...</p>
      </div>
    </div>
  );
}
