# CLAUDE.md - EroMusa AI

## Visão Geral do Projeto

**EroMusa AI** é uma plataforma de criação de vídeos com inteligência artificial. O projeto é um Next.js 14+ com TypeScript, Tailwind CSS e App Router.

---

## Design Base

### Paleta de Cores
| Nome | Hex | Uso |
|------|-----|-----|
| Background | `#0A0B14` | Fundo principal (dark) |
| Card | `#161827` | Cartões e elementos elevados |
| Border | `#1E2130` | Bordas e separadores |
| Text Primary | `#FFFFFF` | Texto principal |
| Text Secondary | `#9CA3AF` | Texto secundário |
| Accent Orange | `#F97316` | Botões CTA, destaques |
| Accent Purple | `#8B5CF6` | Tags, badges especiais |

### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Fallback**: sans-serif

### Estilo Visual
- **Tema**: Dark mode moderno
- **Bordas**: Rounded corners (2xl para cards, lg para botões)
- **Glassmorphism**: backdrop-blur em elementos sobrepostos
- **Scrollbar**: Personalizada com cores do tema

---

## Estrutura do Projeto

```
src/
├── app/                         # App Router (Next.js 14+)
│   ├── actions/
│   │   └── auth.ts             # Server Actions para autenticação
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts    # Callback OAuth do Supabase
│   │   ├── generate/
│   │   │   └── route.ts        # Rota API para geração de vídeos (LeakifyHub)
│   │   ├── payments/
│   │   │   └── route.ts        # Rota API para criar pagamentos (Vexutopia)
│   │   └── webhooks/
│   │       └── vexutopia/
│   │           └── route.ts    # Webhook para receber pagamentos (Vexutopia)
│   ├── gallery/
│   │   └── page.tsx            # Galeria de gerações do usuário (Supabase)
│   ├── pricing/
│   │   └── page.tsx            # Planos e preços com modal de pagamento
│   ├── privacy/
│   │   └── page.tsx            # Política de Privacidade
│   ├── settings/
│   │   └── page.tsx            # Página de configurações do usuário
│   ├── support/
│   │   └── page.tsx            # Página de suporte
│   ├── terms/
│   │   └── page.tsx            # Termos de Uso
│   ├── globals.css             # Estilos globais + fonte + animações
│   ├── layout.tsx              # Layout raiz (Navbar + Footer + Providers)
│   └── page.tsx                # Home (Discover) - 88 templates com paginação
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navegação responsiva com dropdown
│   │   └── Footer.tsx          # Rodapé com links
│   ├── LoginModal.tsx           # Modal de login/signup com OAuth
│   ├── SettingsModal.tsx        # Modal de configurações
│   └── video/
│       ├── TemplateCard.tsx     # Card de template com hover animations
│       ├── VideoCreateModal.tsx # Modal completo com crop, upload, preview
│       └── VideoPlaceholder.tsx # Placeholder animado para vídeos
├── context/
│   ├── AuthContext.tsx          # Context de autenticação (Supabase)
│   └── SettingsContext.tsx      # Context de configurações (localStorage)
├── lib/
│   ├── supabase.ts              # Cliente Supabase (browser)
│   └── supabase/
│       └── server.ts            # Cliente Supabase (server)
├── services/
│   ├── leakifyApi.ts            # Cliente da API LeakifyHub
│   ├── uploadImage.ts           # Serviço de upload de imagem (imgbb)
│   ├── galleryStore.ts           # Store da galeria (localStorage - legado)
│   ├── videoJobService.ts        # Service de jobs de vídeo (Supabase)
│   ├── vexutopiaApi.ts          # Cliente da API Vexutopia (pagamentos)
│   └── paymentService.ts        # Service de pagamentos (Supabase)
└── App.jsx                      # App.jsx legado
```

---

## Roteamento

| Rota | Página | Descrição |
|------|--------|------------|
| `/` | Discover | Grid de templates com paginação |
| `/gallery` | Gallery | Galeria de vídeos (banco de dados) |
| `/pricing` | Pricing | Planos e preços |
| `/settings` | Settings | Configurações do usuário |
| `/support` | Support | Página de suporte com formulário |
| `/terms` | Terms | Termos de Uso |
| `/privacy` | Privacy | Política de Privacidade |

---

## Tecnologias

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Autenticação**: Supabase Auth (email/senha + OAuth: Google, GitHub, Discord, Apple)
- **Banco de Dados**: Supabase (PostgreSQL) - Tabelas: `users`, `video_jobs`
- **Storage**: Supabase Storage (bucket `images` para upload de fotos)
- **Ícones**: SVG inline (Heroicons style)
- **Imagens**: Next.js Image component + CDN externo
- **Fontes**: Google Fonts (Inter)
- **API Externa**: LeakifyHub (geração de vídeos AI)
- **Hospedagem Imagens**: Supabase Storage (via API route)

---

## Navbar - Estrutura Responsiva

### Desktop (≥640px) - Logado
```
[Logo EroMusa]  --------  [Discover] [Gallery] [Pricing]  --------  [💰 Credits] [Upgrade] [⚙️]
```

### Desktop (≥640px) - Deslogado
```
[Logo EroMusa]  --------  [Discover] [Gallery] [Pricing]  --------  [Sign In] [⚙️]
```

### Mobile (<640px) - Logado
```
[Logo EroMusa]                    [💰 Credits] [⚙️]
         [Discover] [Gallery] [Pricing]
```

### Mobile (<640px) - Deslogado
```
[Logo EroMusa]                    [Login] [⚙️]
         [Discover] [Gallery] [Pricing]
```

### Settings Dropdown
- **Logado**: Email do usuário, Upgrade/Credits, Support, Settings, Auto Play Toggle, Sign Out
- **Deslogado**: Sign In/Sign Up button + Auto Play Toggle

### Z-Index
- Navbar: `z-50`
- Modal principal: `z-50`
- Modal crop: `z-60`
- LoginModal: `z-[70]`

---

## Componentes

### TemplateCard
- Aspect ratio: `aspect-[2/3]`
- Thumbnail + gradiente animado no hover
- Badges: "Free" (verde), "Popular" (roxo)
- Tags e título na parte inferior
- Ícone de play centralizado no hover

### VideoCreateModal
- Upload de imagem (drag & drop ou clique)
- Sistema de crop completo (8 handles, grid de terços)
- Preview da foto cortada
- Instruções do template (Avoid / Photo Tips)
- Exibe créditos necessários e botão Create Video
- Redireciona para Gallery após criar

### LoginModal
- Botões OAuth: Google, GitHub, Discord, Apple
- Separador "Or continue with email"
- Formulário: Email + Password
- Estados: Loading (spinner), Erro (vermelho), Sucesso (verde)
- Lógica: Login → se falhar cria conta automaticamente

### Footer
- Links: Support, Terms of Use, Privacy Policy
- Copyright com ano dinâmico

---

## Discover Page

### Layout
- **Desktop**: 4 templates por linha
- **Mobile**: 2 templates por linha
- **Total**: 88 templates héteros

### Paginação
- 12 por página
- Navegação: `< 1 2 3 4 5 ... 8 >`
- Página atual destacada em laranja (`bg-accent-orange`)
- Botões < e > com `w-12 h-12`
- Scroll suave ao trocar de página

### Templates
- Thumbnails reais do CDN: `https://lf-storage-pull-zone.b-cdn.net/static/posters/`
- Cada template tem: título, tags, gradiente, duração, créditos, instruções, styleId

---

## Gallery Page

### Estados
- **Empty**: Ilustração + CTA "Discover Templates"
- **Loading**: Spinner centralizado
- **With Jobs**: Grid 4x3 (desktop) / 2x3 (mobile)

### Job Card
- **Processing/Pending**: Foto do usuário (opacity-40) + spinner
- **Completed**: Thumbnail da foto → play = vídeo em loop
- **Failed**: Overlay vermelho + botão Retry

### Ações
- **Download**: Ícone de download + modal de confirmação
- **Delete**: Ícone de lixeira + modal de confirmação
- **72h Warning**: Banner amarelo quando há vídeos

### Polling
- A cada 5 segundos verifica jobs em processamento
- Event listener para novo job criado via VideoCreateModal

---

## Pricing Page

### Planos
| Plano | Preço | Créditos | Destaque |
|-------|-------|----------|----------|
| Basic | $9.99 | 300 Credits | - |
| Plus | $29.99 | 1500 Credits | Most Popular |
| Prime | $49.99 | 3000 Credits | - |

### Modal de Pagamento
- Credit/Debit Card
- Cryptocurrency
- Ícone de moeda de ouro nos cards

### FAQ Accordion
- 5 perguntas frequentes com toggle

---

## Settings Page

### Opções
- Support (link)
- Change Email
- Change Password
- Change Language

### Danger Zone
- Sign Out
- Delete Account (vermelho)

---

## AuthContext - Autenticação

### Interface
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  credits: number;
  loading: boolean;
  signIn: (email, password) => Promise<error | null>;
  signUp: (email, password) => Promise<error | null>;
  signInWithGoogle: () => Promise<error | null>;
  signInWithGithub: () => Promise<error | null>;
  signInWithDiscord: () => Promise<error | null>;
  signInWithApple: () => Promise<error | null>;
  signOut: () => Promise<void>;
}
```

### Tabela users (Supabase)
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
-- IMPORTANTE: Desativar RLS para funcionar corretamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Tabela video_jobs (Supabase)
```sql
CREATE TABLE video_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_style_id TEXT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  result_url TEXT,
  user_photo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API LeakifyHub

### Configuração
- **Base URL**: `https://api.leakifyhub.fun/api/v1`
- **Auth**: `Authorization: Bearer sk_test_...`
- **Chave**: `LEAKIFY_API_KEY` (env)

### Fluxo de Geração
1. Upload imagem → Supabase Storage
2. POST `/jobs/generate` com `image_url`, `style`, `type: "video"`
3. Polling GET `/jobs/{job_id}` a cada 2s
4. Atualiza status no banco quando pronto

---

## Sistema de Créditos (Reconstruído - Julho 2026)

O sistema de créditos opera sob o princípio de **Single Source of Truth (SSOT)**: o banco de dados Supabase é a única fonte de verdade. Não existem bônus automáticos em memória ou criação de perfis com créditos durante consultas.

### Fluxo de Operações
1. **Consulta**: `Frontend` $\rightarrow$ `AuthContext` $\rightarrow$ `/api/user/credits` $\rightarrow$ `Supabase (users.credits)` $\rightarrow$ `UI`.
2. **Soma (Compra)**: `Vexutopia Webhook` $\rightarrow$ `/api/webhooks/vexutopia` $\rightarrow$ `Lê saldo atual` $\rightarrow$ `Soma créditos comprados` $\rightarrow$ `Update Supabase`.
3. **Dedução (Uso)**: `VideoCreateModal` $\rightarrow$ `/api/video-credits/deduct` $\rightarrow$ `Valida saldo` $\rightarrow$ `Subtrai custo` $\rightarrow$ `Update Supabase`.

### Endpoints de Créditos
- `GET /api/user/credits`: Retorna o saldo exato do usuário. Não cria perfis.
- `POST /api/video-credits/deduct`: Dedução segura com validação de saldo insuficiente.
- `POST /api/webhooks/vexutopia`: Processa pagamentos e soma créditos ao saldo real.

---

## Variáveis de Ambiente

---

## SettingsContext

### Configurações
| Configuração | Tipo | Padrão | Descrição |
|--------------|------|--------|-----------|
| `autoPlayVideos` | boolean | false | Auto-play de vídeos nos templates |

### Persistência
- localStorage (`eromusa-settings`)
- Carrega no mount, salva em mudança

---

## Fluxo de Trabalho

1. **Consultar documentacao.md** antes de implementar funcionalidades existentes
2. **Consultar CLAUDE.md** para padrões de design e estrutura
3. **Testar em ambos breakpoints** (mobile e desktop) antes de confirmar mudanças
4. **Manter documentacao.md atualizado** quando uma implementação for confirmada

---

## Roadmap - Status

- [x] Página Discover (88 templates com paginação)
- [x] Página Gallery (banco de dados, polling, download, delete)
- [x] Página Pricing (planos, FAQ, modal pagamento)
- [x] Página Settings
- [x] Página Support (formulário de contato)
- [x] Página Terms of Use
- [x] Página Privacy Policy
- [x] Sistema de Credits (UI - moeda de ouro global)
- [x] Settings Context (autoPlayVideos + localStorage)
- [x] VideoCreateModal completo (crop, upload, preview, instruções)
- [x] Integração API LeakifyHub (sandbox)
- [x] Paginação (12 por página, 4 desktop / 2 mobile)
- [x] Thumbnails reais do LeakifyHub CDN
- [x] Autenticação de usuário (email/senha + OAuth)
- [x] LoginModal (Google, GitHub, Discord, Apple + email)
- [x] Navbar dinâmica (mostra créditos se logado, Login se deslogado)
- [x] Geração de vídeo com IA (API LeakifyHub real)
- [x] Galeria com banco de dados (Supabase)
- [x] Upload de imagem via Supabase Storage
- [x] Popup de confirmação (download/deletar)
- [x] Aviso de expiração de 72h
- [x] Paginação maior e mais visível
- [x] Login ao clicar "Create Video" deslogado
- [x] Créditos escondidos no modal quando deslogado
- [x] TemplateCard com animações de gradiente no hover
- [x] VideoPlaceholder component
- [x] Settings dropdown na Navbar
- [x] Server Actions para autenticação
- [x] Integração API Vexutopia (pagamentos)
- [x] Webhook para confirmação de pagamento
- [x] Adição automática de créditos após pagamento

---

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://srmfhpozpxuocyiiyhqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# LeakifyHub
LEAKIFY_API_KEY=sk_test_c1c729cd477db89b204474094579958e

# Vexutopia (Pagamentos)
VEXUTOOPIA_API_KEY=vex_test_...
VEXUTOOPIA_WEBHOOK_SECRET=...

# Base URL para webhooks
NEXT_PUBLIC_BASE_URL=https://eromusa.com

# ImgBB (opcional)
NEXT_PUBLIC_IMGBB_KEY=...
```

---

## Deployment - GitHub + Vercel

### Configuração Atual (Julho 2026)
- **GitHub**: https://github.com/protaculos/eromusa
- **Branch principal**: `main`
- **Vercel**: Conectado ao repositório GitHub

### Fluxo de Deploy Automático
```
Desenvolvedor faz mudanças no código
    ↓
git add . && git commit -m "descrição"
    ↓
git push
    ↓
Vercel detecta push → compila → publica automaticamente
```

### Para Atualizar o Site
1. Desenvolvedor faz as mudanças no código
2. Roda: `git add . && git commit -m "descrição" && git push`
3. Aguarda 1-2 minutos
4. Site atualizado em: `https://eromusa.vercel.app` (ou domínio customizado)

### Solução de Problemas de Build (Vercel)
- **Erro de Export Default**: Se o build falhar com "found pages without a React Component as default export", certifique-se de que todos os arquivos em `src/pages/` ou `app/` possuem um `export default function ComponentName() { ... }`. Arquivos vazios causam falha no build.

### Plugins e Ferramentas
- Para adicionar plugins da Vercel: `npx plugins add vercel/vercel-plugin`

### Variáveis de Ambiente no Vercel
Ao fazer deploy, configurar no Vercel:
| Name | Description |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin do Supabase |
| `LEAKIFY_API_KEY` | Chave da API LeakifyHub |
| `VEXUTOOPIA_API_KEY` | Chave da API Vexutopia |
| `VEXUTOOPIA_WEBHOOK_SECRET` | Segredo para webhook |
| `NEXT_PUBLIC_BASE_URL` | URL do site (ex: https://seudominio.com) |

### IMPORTANTE: Webhook da Vexutopia
Após configurar o domínio no Vercel:
1. Configurar webhook no painel Vexutopia: `https://seudominio.com/api/webhooks/vexutopia`
2. Atualizar `NEXT_PUBLIC_BASE_URL` no Vercel com o domínio correto

---

*Última atualização: 15/07/2026*