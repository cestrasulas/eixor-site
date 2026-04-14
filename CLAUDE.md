# EIXOR — Barber SaaS

## Stack
- React 19 + TypeScript + Vite 8
- CSS: index.css + App.css (sem Tailwind ainda)
- Sem backend integrado (Supabase previsto)
- Build: `npm run build` | Dev: `npm run dev`

## Estrutura
```
src/
  App.tsx          # componente raiz
  main.tsx         # entry point
  App.css
  index.css
  assets/          # imagens estáticas
```

## Convenções
- Componentes em PascalCase
- Nomes de arquivos em inglês
- Comentários em português
- Sem dependências novas sem confirmar primeiro

## Foco atual
Interface/UI — telas e componentes visuais

## Nunca faça
- Alterar `vite.config.ts` sem avisar
- Instalar pacotes sem listar e confirmar
- Apagar assets sem confirmar

## Quando adicionar Supabase
Confirmar schema antes de qualquer migração
