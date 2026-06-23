import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import './responsive.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ToastContainer';
import InvoiceModal from '@/components/InvoiceModal';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['300', '400', '500', '600', '700', '800', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'StreamNova — Next-Gen Video Streaming & Social Platform',
  description: 'Experience premium video streaming, real-time VoIP calls, AI-powered comments, multilingual support, and a cinematic player. Stream, connect, and collaborate — all in one platform.',
  keywords: 'streaming, video, social, VoIP, AI translation, premium, HD, entertainment',
  openGraph: {
    title: 'StreamNova',
    description: 'Premium streaming meets social intelligence.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080b14" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AppProvider>
          <Navbar />
          <main className="page-main">
            {children}
          </main>
          <ToastContainer />
          <InvoiceModal />
        </AppProvider>
      </body>
    </html>
  );
}
