import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Lctron — Windows Optimization Suite',
  description: 'Boost FPS, crush input lag, free up RAM and eliminate Windows bloat. The all-in-one PC optimizer built for gamers.',
  keywords: 'windows optimizer, fps boost, gaming performance, pc optimization, input lag',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
