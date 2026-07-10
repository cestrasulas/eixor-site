import './App.css'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Empresa } from './components/About'
import { ComoFunciona } from './components/HowItWorks'
import { Produtos } from './components/Products'
import { Compromissos } from './components/TrustStrip'
import { Faq } from './components/Faq'
import { Contato } from './components/Contact'
import { Footer } from './components/Footer'

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Empresa />
      <ComoFunciona />
      <Produtos />
      <Compromissos />
      <Faq />
      <Contato />
      <Footer />
    </>
  )
}
