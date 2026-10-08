import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './features/landing/LandingPage';


function App() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <Footer />
    </>
  );
}

export default App;
