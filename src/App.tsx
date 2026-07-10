import './App.css'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Empresa } from './components/About'
import { Produtos } from './components/Products'
import { Contato } from './components/Contact'
import { Footer } from './components/Footer'

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Empresa />
      <Produtos />
      <Contato />
      <Footer />
    </>
  )
}
