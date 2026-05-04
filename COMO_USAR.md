# Template Mestre — Studio de Estética Premium

## Fluxo para nova cliente

1. **Duplique esta pasta** e renomeie para o nome do studio
   ```
   Template mestre/ → Studio Giovanna/
   ```

2. **Edite apenas `src/brandConfig.js`** — é o único arquivo que você precisa tocar para personalizar o app:

| Campo | O que muda |
|---|---|
| `studioName` | Nome que aparece no header e no título da aba |
| `studioTagline` | Slogan abaixo do nome |
| `logoUrl` | URL da logo (ou `null` para usar o nome em texto) |
| `primaryColor` | Cor dos botões, ícones e destaques |
| `secondaryColor` | Cor de fundo da página |
| `accentColor` | Cor do texto principal |
| `fontFamily` | Nome de qualquer [Google Font](https://fonts.google.com/) |
| `whatsappNumber` | Número do WhatsApp (só números) |
| `address` / `mapsUrl` | Endereço e link do Google Maps |
| `adminPassword` | Senha do painel admin |
| `banners` | Imagens do carrossel da Home |
| `weekHighlights` | Cards de destaques/promoções |
| `services` | Catálogo de serviços e preços |
| `products` | Loja de produtos |

3. **Instale as dependências** (apenas na primeira vez):
   ```bash
   npm install
   ```

4. **Rode localmente** para testar:
   ```bash
   npm run dev
   ```

5. **Gere o build** para publicar:
   ```bash
   npm run build
   ```
   Os arquivos ficarão em `dist/` — faça upload no Netlify, Vercel ou qualquer hospedagem estática.

---

## Publicação gratuita no Netlify

1. Acesse [netlify.com](https://netlify.com) e crie uma conta
2. Arraste a pasta `dist/` para a área de deploy
3. Pronto — o app já é um PWA instalável no celular!

---

## Gerenciamento do painel Admin

A dona do studio acessa pela aba **Admin** (ícone de cadeado) no app.

- A senha é definida em `brandConfig.adminPassword`
- No painel ela pode: adicionar/editar/remover serviços, trocar banners, gerenciar estoque de produtos e ver todos os agendamentos
- Todas as alterações são salvas automaticamente no dispositivo (localStorage)

---

## Paletas de cores sugeridas

| Estilo | `primaryColor` | `secondaryColor` | `accentColor` |
|---|---|---|---|
| Rose Gold (padrão) | `#C9A96E` | `#F7F3EE` | `#6B4F3A` |
| Blush Millennial | `#D4A5A5` | `#FDF0F0` | `#5C3333` |
| Sage & Earth | `#8FAF8A` | `#F2F5EF` | `#2D4A2A` |
| Champagne | `#BFA980` | `#FAF7F2` | `#4A3728` |
| Dark Luxury | `#9B8B7A` | `#1A1614` | `#E8DDD0` |
| Lilás Soft | `#B5A7C9` | `#F3F0F9` | `#3D2D55` |
