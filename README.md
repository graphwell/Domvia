# LeadBroker AI

Plataforma SaaS inteligente para corretores de imóveis — captação de leads, IA conversacional, páginas inteligentes de imóveis e ferramentas de gestão.

## Stack

- **Next.js 14** com App Router
- **TypeScript**
- **TailwindCSS** com design system customizado
- **Recharts** para dashboards
- **API Routes** (pronto para OpenAI, Supabase, etc.)

## Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/login` | Login |
| `/register` | Cadastro |
| `/dashboard` | Dashboard do corretor |
| `/properties` | Gestão de imóveis |
| `/properties/new` | Cadastrar imóvel |
| `/leads` | Sistema de leads |
| `/tools` | Ferramentas de IA |
| `/tours` | Tours 360° |
| `/plans` | Planos e créditos |
| `/imovel/[id]` | Página pública inteligente do imóvel |

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.local.example .env.local

# Rodar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e preencha:

- `OPENAI_API_KEY` — para IA real (sem isso usa respostas mock inteligentes)
- `DATABASE_URL` — Supabase, PlanetScale, Neon, etc.
- `NEXTAUTH_SECRET` — para autenticação real

## Deploy na Vercel

1. Push para GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no dashboard da Vercel
4. Deploy automático a cada push na branch `main`

## Integrações Futuras

- [ ] **Banco de dados**: Supabase / PlanetScale / Neon
- [ ] **Auth**: NextAuth.js com Google/GitHub OAuth
- [ ] **Storage**: Vercel Blob / Cloudflare R2 para fotos
- [ ] **AI real**: OpenAI GPT-4o
- [ ] **Pagamentos**: Stripe para assinaturas
- [ ] **Tour 360°**: Pannellum ou Photo Sphere Viewer

## Arquitetura

```
leadbroker-ai/
├── app/
│   ├── (public)/          # Landing page
│   ├── (auth)/            # Login, registro
│   ├── (dashboard)/       # Dashboard autenticado
│   │   ├── dashboard/
│   │   ├── properties/
│   │   ├── leads/
│   │   ├── tools/
│   │   ├── tours/
│   │   └── plans/
│   ├── imovel/[id]/       # Página pública do imóvel (Lead Page)
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Primitivas (Button, Card, Input, Badge)
│   ├── layout/            # Header, Footer, Sidebar
│   ├── landing/           # Seções da landing page
│   ├── dashboard/         # Widgets do dashboard
│   ├── property/          # Gestão de imóveis + SmartLeadPage
│   ├── leads/             # Sistema de leads
│   └── tools/             # Ferramentas de IA
├── lib/
│   ├── ai.ts              # Wrapper IA (mock → OpenAI)
│   ├── financing.ts       # Calculadora de financiamento
│   ├── utils.ts           # Utilitários
│   └── mock-data.ts       # Dados de demonstração
└── types/
    └── index.ts           # TypeScript interfaces
```
