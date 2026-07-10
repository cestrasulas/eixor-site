import { useState, useEffect, useRef, type ReactNode } from 'react'

// ── useInView hook ──────────────────────────────────────────────────────────

export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function FadeIn({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`fade-in${visible ? ' visible' : ''}${delay === 1 ? ' d1' : delay === 2 ? ' d2' : delay === 3 ? ' d3' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ── Counter ─────────────────────────────────────────────────────────────────

export function Counter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useInView(0.5)
  const started = useRef(false)
  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    // respeita usuários com preferência por menos movimento
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target)
      return
    }
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target, duration])
  return <span ref={ref}>{val}</span>
}
