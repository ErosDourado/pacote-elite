# Firestore — Guia rápido

Este guia explica:

1. Como **resolver o erro** "missing or insufficient permission"
2. Como deixar **só admin escrever** (jeito simples — coleção `admins`)
3. **Coleções e schemas** esperados pelos services
4. **Estado atual** da migração

---

## 1. Resolver o erro "missing or insufficient permission"

Se aparecer esse erro no app, é porque as regras do Firestore estão travadas. **Solução em 1 minuto:**

1. Abra https://console.firebase.google.com → seu projeto
2. **Build → Firestore Database → aba Regras**
3. Apague tudo que está lá
4. Cole isto (versão de desenvolvimento, expira em 30/06/2026):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 6, 30);
    }
  }
}
```

5. Clique em **Publicar**

> Pronto. O app volta a funcionar. Antes de **30/06/2026** você precisa migrar pra V2 (passo 2 abaixo).

---

## 2. Deixar só admin escrever — jeito simples

A ideia é simples: **se o seu e-mail está cadastrado na coleção `admins`, você é admin no app.**

Sem terminal. Sem chave. Sem código rodando. Só você + o console do Firebase.

### Passo A — Ativar Login (Authentication)

1. Console do Firebase → **Build → Authentication → Get started**
2. Aba **Sign-in method** → ative **E-mail/Senha** → Save

✅ Pronto. O sistema de login está ligado.

### Passo B — Criar sua conta dentro do app

Abra seu app rodando, clica nos 3 pontinhos do menu → **Entrar** → toca em **Criar conta** → coloca seu e-mail, nome e senha → cria.

(Você também pode criar pela aba **Authentication → Users → Add user** no console — funciona igual.)

### Passo C — Deixar você admin

1. Console do Firebase → **Firestore Database → Data**
2. Clica em **Iniciar coleção** (Start collection)
3. ID da coleção: digite `admins` → Próximo
4. Para o **ID do documento**, digite o **mesmo e-mail** que você usou pra criar a conta (ex: `laura@gmail.com`)
5. Adicione um campo qualquer só pra ter conteúdo (sugestão: `role` = `admin`)
6. Salvar

✅ Pronto. **No próximo login, você é admin.** Se já está logado, faça logout e login de novo (o app detecta automaticamente).

> Pra adicionar mais admins depois, é só repetir o passo C com outro e-mail.

### Passo D — Trocar pelas regras seguras (V2)

Quando confirmar que está tudo funcionando (você consegue ver o painel admin, cliente comum não consegue):

1. Console → Firestore → Regras
2. Apaga tudo
3. Cola o bloco **VERSÃO 2** que está dentro do `firestore.rules` (descomenta e remove a V1)
4. Publicar

A partir daí, **só quem tem doc na coleção `admins` consegue escrever no banco**. Cliente comum só lê.

---

## 3. Como funciona no app

### Cenários

| Situação | O que aparece |
|---|---|
| Não logado | Menu mostra: Meu Perfil, **Entrar**. Painel Admin/Financeiro escondidos. |
| Logado mas não admin | Menu mostra: Meu Perfil, **Sair**. Painel Admin/Financeiro escondidos. Conta normal de cliente. |
| Logado e e-mail está em `admins` | Menu mostra: Meu Perfil, Painel Admin, Painel Financeiro, Sair. Acesso total. |

### Tentou acessar admin sem estar logado?

O app redireciona automaticamente pra tela de Login. Após logar, volta pra rota original.

### Como deslogar?

Menu (3 pontinhos) → **Sair**. Ele faz signOut do Firebase e o app volta ao estado de visitante.

### "Esqueci minha senha"

Funcionalidade nativa do Firebase Auth. Por enquanto não tem botão no app — me avise quando precisar e eu adiciono `sendPasswordResetEmail`.

---

## 4. Coleções esperadas pelos services

| Arquivo | Coleção | Schema (campos principais) |
|---|---|---|
| `servicesService.js` | `servicos` | name, category, price, duration, icon, active, order |
| `appointmentsService.js` | `appointments` | clientName, clientPhone, clientEmail, service, date, time, status, paymentStatus, userId, clientId |
| `productsService.js` | `products` | name, price, category, imageUrl, inStock, stockQty |
| `bannersService.js` | `banners` | url, title, subtitle, ctaLabel, ctaType, ctaTarget, vipOnly, order |
| `feedService.js` | `feed_posts` | imageUrl, title, procedure, description, serviceId |
| `linksService.js` | `links` | label, url, icon, order |
| `proceduresService.js` | `procedures` | titulo, imagem, descricao, order |
| `templatesService.js` | `content/messages` (doc único) | pending, confirmed, concluded, cancelled, waitlist |
| `waitlistService.js` | `fila_espera` | clientName, clientPhone, serviceId, preferredDate, preferredTime, wantEarlier |
| `clientesService.js` | `clientes` | name, phone, email, isVip, notes |
| `clientsSearchService.js` | `users` + `clientes` | (busca unificada — não escreve) |
| `adminsService.js` | `admins` | role, addedAt (ID do doc é o e-mail) |

> `createdAt` / `updatedAt` são preenchidos automaticamente.

---

## 5. Variáveis dos templates de WhatsApp

| Tag | Substituído por |
|---|---|
| `{nome}` | Nome do cliente |
| `{servico}` | Nome do serviço |
| `{data}` | Data formatada PT-BR |
| `{hora}` | Horário (HH:MM) |

Exemplo: `Olá {nome}, confirmando {servico} em {data} às {hora}.`

Cinco status configuráveis: `pending`, `confirmed`, `concluded`, `cancelled`, `waitlist`.

---

## 6. Estado atual da migração de UI

| Componente | Fonte de dados |
|---|---|
| **ServicesAdmin** | ✅ Firestore (real-time + CRUD) |
| **MessagesAdmin** | ✅ Firestore (`content/messages` real-time) |
| **Login / Auth** | ✅ Firebase Auth + coleção `admins` |
| **TopBar gating** | ✅ Esconde admin/finance se não admin |
| HomeAdmin (Feed/Banners/Procedimentos/Links) | ⏳ Mock localStorage (services prontos) |
| AppointmentsAdmin | ⏳ Mock localStorage (services + checkSlotAvailable prontos) |
| StockAdmin / Catálogo | ⏳ Mock localStorage |
| ClientsAdmin | ⏳ Mock localStorage (excluir é local) |
| FinanceAdmin | ⏳ Mock localStorage (deriva de appointments) |
| Modal de Fila de Espera no cancelar | ⏳ Service pronto, falta plugar |
| Auto-preenchimento no agendamento | ⏳ Service pronto, falta plugar |

---

## 7. Importação de dados (seed)

Pra popular o Firestore com os dados de demonstração que estão em `mockData.js`, peça que eu monto um script `seed.js`. Ainda não existe.
