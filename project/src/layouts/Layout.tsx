import { ReactNode } from 'react';
import Header from '../components/navigation/Header';
import Footer from '../components/navigation/Footer';
// import BackendStatusBanner from '../components/common/BackendStatusBanner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <BackendStatusBanner /> */}
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;