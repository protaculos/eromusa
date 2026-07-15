# Documentação - EroMusa AI

## Resumo do Desenvolvimento

Este documento resume todas as decisões e implementações que foram testadas e confirmadas como funcionais durante o desenvolvimento do projeto.

**Última atualização: 15/07/2026**

---

## 1. Estrutura de Arquivos - Status Atual

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts              ✅ Server Actions (signIn, signUp, signOut, getSession, getUser)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts    ✅ Callback OAuth Supabase
│   │   └── generate/
│   │       └── route.ts        ✅ API route - Upload + LeakifyHub + Polling
│   ├── gallery/
│   │   └── page.tsx            ✅ Gallery completa com Supabase + Polling
│   ├── pricing/
│   │   └── page.tsx            ✅ Planos + FAQ + Modal pagamento
│   ├── privacy/
│   │   └── page.tsx            ✅ Política de Privacidade completa
│   ├── settings/
│   │   └── page.tsx            ✅ Settings com modal para cada opção
│   ├── support/
│   │   └── page.tsx            ✅ Formulário de suporte + FAQ + contato
│   ├── terms/
│   │   └── page.tsx            ✅ Termos de Uso completos
│   ├── globals.css              ✅ Estilos + animações (float, gradient, shimmer, etc)
│   ├── layout.tsx              ✅ Layout raiz com AuthProvider + SettingsProvider
│   └── page.tsx                ✅ Discover com 88 templates + paginação
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          ✅ Navbar responsiva com dropdown de settings
│   │   └── Footer.tsx          ✅ Footer com links (Support, Terms, Privacy)
│   ├── LoginModal.tsx           ✅ Login com OAuth (Google, GitHub, Discord, Apple) + email
│   ├── SettingsModal.tsx        ✅ Modal de configurações
│   └── video/
│       ├── TemplateCard.tsx     ✅ Card com gradiente animado no hover
│       ├── VideoCreateModal.tsx✅ Modal completo com crop + upload + preview
│       └── VideoPlaceholder.tsx✅ Placeholder animado
├── context/
│   ├── AuthContext.tsx          ✅ Autenticação com Supabase + credits
│   └── SettingsContext.tsx       ✅ Configurações com localStorage
├── lib/
│   ├── supabase.ts              ✅ Cliente browser
│   └── supabase/
│       └── server.ts            ✅ Cliente server-side
└── services/
    ├── leakifyApi.ts            ✅ Cliente API LeakifyHub
    ├── uploadImage.ts           ✅ Upload para imgbb
    ├── galleryStore.ts           ✅ Store legado
    └── videoJobService.ts        ✅ CRUD de jobs no Supabase
```

---

## 2. Páginas Implementadas

### 2.1 Discover Page (/) ✅
- **88 templates héteros** da API LeakifyHub
- **Paginação**: 12 por página (4 desktop / 2 mobile)
- **Navegação**: `< 1 2 3 4 5 ... 8 >` com página atual em laranja
- **Thumbnails reais** do CDN LeakifyHub
- **TemplateCard** com gradiente animado no hover
- Badges "Free" (verde) e "Popular" (roxo)
- Toggle autoplay nas configurações
- Ao clicar abre o VideoCreateModal

### 2.2 Gallery Page (/gallery) ✅
- **Estados**: Empty, Loading, With Jobs
- **Job Card**:
  - Processing/Pending: Foto (opacity-40) + spinner
  - Completed: Thumbnail → play = vídeo em loop
  - Failed: Overlay vermelho + Retry
- **Ações**: Download + Delete com modal de confirmação
- **72h Warning**: Banner amarelo quando há vídeos
- **Polling**: A cada 5s verifica jobs + Event listener para novo job

### 2.3 Pricing Page (/pricing) ✅
- **Planos**: Basic $9.99 / Plus $29.99 (Most Popular) / Prime $49.99
- **Modal de pagamento**: Credit/Debit ou Cryptocurrency
- **FAQ Accordion**: 5 perguntas frequentes
- Ícone de moeda de ouro nos cards

### 2.4 Settings Page (/settings) ✅
- **Opções**: Support (link), Change Email, Change Password, Change Language
- **Danger Zone**: Sign Out, Delete Account (vermelho)
- Modais para cada opção

### 2.5 Support Page (/support) ✅
- **Formulário**: Subject + Message
- **FAQ**: 3 perguntas frequentes
- **Contato**: Email sac@eromusa.com, Response Time 24h

### 2.6 Terms Page (/terms) ✅
- 16 seções completas incluindo:
  - Prohibited Content
  - Refunds Policy (sem reembolsos)
  - Creator Rewards and Payouts
  - DMCA
  - Governing Law: Saint Vincent and the Grenadines

### 2.7 Privacy Page (/privacy) ✅
- 12 seções completas
- 1. Information We Collect (tabela)
- 9. Delete Your Account
- Contato: privacy@eromusa.com

---

## 3. Sistema de Crop - Implementação Completa

### Fluxo
```
Upload (drag & drop ou clique) → Crop Modal → Preview → Create Video
```

### Modal de Crop
- **Container**: `aspect-[3/4]` com overlay escuro
- **8 handles**: 4 cantos + 4 bordas
- **Drag**: Centro para reposicionar
- **Resize**: Bordas/cantos para redimensionar
- **Grid**: Regra dos terços (linhas brancas)
- **Overlay**: Fundo escuro fora da área selecionada
- **Botões**: Cancel / Confirm
- **Caixa inicial**: 100% da imagem

### Upload Area
- Borda pontilhada laranja: `border-dashed border-accent-orange/70`
- Thumbnail do template como referência (opacity-40)
- Ícone de câmera centralizado
- "Drag & Drop" + "Upload your starting frame"
- Botão X para remover foto selecionada
- Aceita: JPG e PNG

---

## 4. Autenticação - Sistema Completo

### LoginModal
- **Props**: `isOpen`, `onClose`, `onLoginSuccess` (callback opcional após login)
- **OAuth Providers**: Google, GitHub, Discord, Apple (botões brancos)
- **Email/Password**: Form com validação
- **Lógica**:
  1. Tenta login com email/senha
  2. Se falhar com "invalid credentials", cria conta
  3. Se outro erro, mostra mensagem
- **OAuth**: Redireciona para provider, volta com sessão
- **Estados**: Loading (spinner), Erro (vermelho), Sucesso (verde)
- **Callback**: `onLoginSuccess` é chamado quando login é bem-sucedido

### AuthContext
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

### Server Actions (auth.ts)
```typescript
signIn(formData)         // Login com email/senha
signUp(formData)         // Criar conta + 50 credits
signOut()                // Logout
getSession()             // Obter sessão atual
getUser()                // Obter usuário atual
```

---

## 5. Navbar - Layout Responsivo

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
```
┌────────────────────────────────────┐
│ user@email.com                     │
│ Signed in                          │
├────────────────────────────────────┤
│ 💰 Upgrade / Credits               │
│ 🎧 Support                         │
│ ⚙️ Settings                        │
├────────────────────────────────────┤
│ ▶️ Auto Play Videos    [Toggle]    │
├────────────────────────────────────┤
│ 🚪 Sign Out                        │
└────────────────────────────────────┘
```

---

## 6. API LeakifyHub - Integração

### Configuração
```typescript
const API_BASE_URL = "https://api.leakifyhub.fun/api/v1";
const API_KEY = "sk_test_c1c729cd477db89b204474094579958e";
```

### API Route (/api/generate)

**POST** - Criar job de vídeo:
1. Recebe: `job_id`, `style_id`, `image_base64`
2. Upload imagem para Supabase Storage
3. Chama LeakifyHub API: `POST /jobs/generate`
4. Polling: GET `/jobs/{job_id}` a cada 2s (30 tentativas)
5. Atualiza status no banco

**GET** - Status do job:
- Parâmetro: `job_id`
- Retorna: status, result_url

### Fluxo Completo de Geração
```
1. Cliente faz upload/crop da foto no VideoCreateModal
2. Clica "Create Video"
3. createVideoJob() → cria registro no Supabase (status: processing)
4. Dispatch event "eromusa-job-created"
5. Redireciona para /gallery
6. API route (/api/generate):
   a. Upload foto para Supabase Storage
   b. POST /jobs/generate para LeakifyHub
   c. Polling a cada 2s até pronto
   d. Atualiza result_url no banco
7. Gallery detecta mudança via polling (5s)
8. Cliente vê vídeo pronto
```

---

## 7. VideoCreateModal - Layout

```
┌─────────────────────────────────────┐
│ Template Name                 [X]   │
├─────────────────────────────────────┤
│ Your Image    │  Output Video       │
│ ┌───────────┐ │ ┌─────────────────┐ │
│ │  Upload   │ │ │   ▶ Video      │ │
│ │  Area     │ │ │   (gradient)   │ │
│ └───────────┘ │ └─────────────────┘ │
├─────────────────────────────────────┤
│ Avoid (✕)       │  Photo Tips (✓)   │
│ • Blurry images  │ • Portrait photo  │
│ • Text/watermarks│ • Good lighting   │
│ • Multiple subs  │ • Specific tip    │
├─────────────────────────────────────┤
│           [💰 Credits] [Create]      │
└─────────────────────────────────────┘
```

---

## 8. Supabase - Tabelas

### Tabela users
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

### Tabela video_jobs
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

-- RLS Policies
CREATE POLICY "Users can view own jobs" ON video_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON video_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON video_jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON video_jobs
  FOR DELETE USING (auth.uid() = user_id);
```

### Bucket images (Storage)
- Bucket: `images`
- Permissão: Public
- Uso: Upload de fotos dos usuários

---

## 8.5. API Vexutopia (Pagamentos)

### Configuração
```typescript
const VEX_BASE_URL = "https://vexutopia.com/api/v1";
// Header: X-API-Key: vex_test_...
```

### Arquivos Implementados
- `src/services/vexutopiaApi.ts` - Cliente da API Vexutopia
- `src/services/paymentService.ts` - Service para gerenciar pagamentos no banco
- `src/app/api/payments/route.ts` - Criar pagamentos
- `src/app/api/payments/verify/route.ts` - Verificar status do pagamento
- `src/app/api/webhooks/vexutopia/route.ts` - Webhook (para produção)

### Fluxo de Pagamento (Desenvolvimento)
1. Cliente seleciona plano na Pricing page
2. POST `/api/payments` → cria payment na Vexutopia
3. Salva registro na tabela `payments` do Supabase (status: pending)
4. Redireciona para `checkout_url` da Vexutopia
5. Cliente paga no checkout
6. Cliente volta ao site
7. GET `/api/payments/verify?payment_id=xxx` verifica status (polling)
8. Se completo: atualiza status + adiciona créditos ao usuário na tabela `users`

### Tabela payments (Supabase)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vexutopia_id TEXT UNIQUE NOT NULL,  -- ID do Vexutopia (tx_xxx)
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- IMPORTANTE: Desativar RLS para funcionar corretamente
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

### Endpoints da API de Pagamentos
- `POST /api/payments` - Cria payment com Vexutopia
- `GET /api/payments/verify?payment_id=xxx` - Verifica status do payment (polling)

### Variáveis de Ambiente
```env
VEXUTOOPIA_API_KEY=vex_test_...
# VEXUTOOPIA_WEBHOOK_SECRET=...  # Para produção
NEXT_PUBLIC_BASE_URL=https://eromusa.com
```

### SQL para criar tabela
```bash
# Execute o SQL em supabase/schema/payments_table.sql
```

---

## 9. Design System

### Cores
```javascript
colors: {
  background: "#0A0B14",    // Fundo principal
  card: "#161827",           // Cartões
  border: "#1E2130",         // Bordas
  "text-primary": "#FFFFFF", // Texto principal
  "text-secondary": "#9CA3AF", // Texto secundário
  "accent-orange": "#F97316", // Botões CTA
  "accent-purple": "#8B5CF6",  // Tags/badges
}
```

### Animações CSS
```css
/* Gradiente animado */
.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

/* Float animations */
.animate-float-1 { animation: float-1 4s ease-in-out infinite; }
.animate-float-2 { animation: float-2 5s ease-in-out infinite; }
.animate-float-3 { animation: float-3 6s ease-in-out infinite; }

/* Shimmer (template cards) */
.animate-shimmer-gold
.animate-neon-pulse
.animate-warm-glow
.animate-elegant-float
```

### Scrollbar
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #161827; }
::-webkit-scrollbar-thumb { background: #1E2130; border-radius: 4px; }
```

---

## 10. Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://srmfhpozpxuocyiiyhqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# LeakifyHub
LEAKIFY_API_KEY=sk_test_c1c729cd477db89b204474094579958e

# ImgBB (opcional - para fallback)
NEXT_PUBLIC_IMGBB_KEY=1b7a1b7a1b7a1b7a1b7a1b7a1b7a1b7a
```

---

## 11. Deploy - GitHub + Vercel

### Status (Julho 2026)
- **GitHub**: https://github.com/protaculos/eromusa
- **Branch**: `main`
- **Vercel**: Configurado e aguardando domínio customizado

### Fluxo de Deploy Automático
```
1. Desenvolvedor faz mudanças no código
2. git add . && git commit -m "descrição"
3. git push
4. Vercel detecta push → compila → publica automaticamente
```

### Para Atualizar o Site
1. Fazer as mudanças no código
2. Rodar: `git add . && git commit -m "descrição" && git push`
3. Aguardar 1-2 minutos
4. Site atualizado automaticamente

### Variáveis de Ambiente no Vercel
| Name | Description |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin do Supabase |
| `LEAKIFY_API_KEY` | Chave da API LeakifyHub |
| `VEXUTOOPIA_API_KEY` | Chave da API Vexutopia |
| `VEXUTOOPIA_WEBHOOK_SECRET` | Segredo para webhook |
| `NEXT_PUBLIC_BASE_URL` | URL do site (atualizar após ter domínio) |

### IMPORTANTE: Webhook da Vexutopia
Após configurar o domínio no Vercel:
1. Configurar webhook no painel Vexutopia: `https://seudominio.com/api/webhooks/vexutopia`
2. Atualizar `NEXT_PUBLIC_BASE_URL` no Vercel com o domínio correto

### Endpoint de Reconciliação (Backup)
`POST /api/payments/reconcile` - Verifica pagamentos pendentes e adiciona créditos automaticamente.
Chamado automaticamente no AuthContext quando usuário faz login.

---

## 12. Fluxo de Trabalho para Deploy

1. **Supabase Dashboard**:
   - Authentication → URL Configuration → Site URL = produção
   - Authentication → Providers → Configurar OAuth
   - Storage → Criar bucket `images` (public)

2. **Vercel/Host**:
   - Configurar env vars
   - Redeploy

3. **Testes**:
   - Login com email
   - Login com OAuth
   - Upload de imagem
   - Geração de vídeo
   - Download de vídeo

---

## 13. Features Implementadas - Checklist

### Core
- [x] Navbar responsiva com dropdown
- [x] Discover com 88 templates + paginação
- [x] Gallery com Supabase + polling
- [x] VideoCreateModal com crop completo
- [x] LoginModal com OAuth + email

### Autenticação
- [x] Email/Password signup
- [x] Email/Password login
- [x] OAuth Google
- [x] OAuth GitHub
- [x] OAuth Discord
- [x] OAuth Apple
- [x] Sign Out
- [x] Credits display

### Settings
- [x] Auto Play Videos toggle
- [x] Settings dropdown na navbar
- [x] Settings page

### Video Generation
- [x] Upload de imagem (drag & drop)
- [x] Sistema de crop (8 handles)
- [x] Upload para Supabase Storage
- [x] Integração LeakifyHub API
- [x] Polling de status
- [x] Download de vídeo
- [x] Delete de vídeo
- [x] Aviso 72h

### Páginas
- [x] Discover (/)
- [x] Gallery (/gallery)
- [x] Pricing (/pricing)
- [x] Settings (/settings)
- [x] Support (/support)
- [x] Terms (/terms)
- [x] Privacy (/privacy)

### Design
- [x] Tema dark
- [x] Animações de gradiente
- [x] Animações float
- [x] Scrollbar customizada
- [x] Responsividade mobile

---

## 14. Pending Items

### Alta Prioridade
- [x] Implementar processamento de pagamento (Vexutopia)
- [ ] Implementar decremento de créditos após geração

### Média Prioridade
- [ ] Adicionar preview de vídeo real nos templates (quando disponível)
- [ ] Sistema de retry automático para jobs falhados
- [ ] Email de notificação quando vídeo ficar pronto

### Baixa Prioridade
- [ ] Sistema de templates favoritos
- [ ] Compartilhamento de vídeos
- [ ] Histórico de generations

---

## 15. Notas Importantes

1. **Next.js App Router**: Estrutura `src/app/`
2. **TypeScript**: Extensão `.tsx`
3. **Tailwind CSS**: Classes utilitárias
4. **Componentes Client**: `"use client"` no topo
5. **Responsividade**: Mobile-first com breakpoints `sm:`, `md:`, `lg:`
6. **OAuth**: Requer configuração no Supabase Dashboard
7. **Credits**: Inicializa com 0 ao criar conta, adicionados após pagamento via Vexutopia
8. **RLS**: Desativar em `users` e `payments` para funcionar corretamente com service role key
9. **Pagamento**: Funciona via polling (verificação após retorno do checkout)

---

## 16. Contatos

- **Suporte**: sac@eromusa.com
- **Privacidade**: privacy@eromusa.com
- **Legal**: legal@eromusa.com
- **DMCA**: dmca@eromusa.com

---

*Documentação criada em: 13/07/2026*
*Última atualização: 16/07/2026*
*Status: Projeto funcional com todas as páginas e sistemas core implementados*