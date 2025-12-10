import Header from './Header';
import Footer from './Footer';
import ReCaptchaProvider from './ReCaptchaProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ReCaptchaProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </ReCaptchaProvider>
  );
}
