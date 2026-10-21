# LATICS — site (Vue 3 + Firebase)

Plano completo em [`../docs/plano-migracao-firebase.md`](../docs/plano-migracao-firebase.md).

## Primeira configuração (uma vez)

1. No [console do Firebase](https://console.firebase.google.com), crie o projeto e ative o plano **Blaze**
   (Uso e faturamento › Detalhes e configurações). Crie um **alerta de orçamento** (ex.: R$ 10/mês) no Google Cloud Billing.
2. No projeto, ative:
   - **Authentication** › Método de login › E-mail/senha
   - **Firestore Database** (modo produção, região `southamerica-east1`)
   - **Storage** (mesma região)
3. Em Configurações do projeto › Seus apps, registre um **app Web** e copie a configuração para `web/.env.local`
   (modelo em `.env.example`).
4. Troque `SEU-PROJETO-ID` em `.firebaserc` pelo ID do projeto (ou rode `firebase use --add`).
5. `firebase login`

## Desenvolvimento

```sh
npm install
npm run dev
```

## Estatísticas de visitas

O site conta quantas vezes cada texto e tecnologia foi aberto, cada vídeo foi assistido e cada artigo foi acessado
(uma vez por item a cada sessão do navegador). Os totais ficam em `estatisticas/{textos|tecnologias|videos|artigos}/itens/{id}`
no Firestore, campo `total`, e por enquanto só são consultados pelo console do Firebase. As Security Rules aceitam apenas
somar 1 a itens publicados; a leitura é restrita a editores.

A contagem está **desligada** até o lançamento. Para ligar, troque `VITE_ESTATISTICAS=false` por `true` em `web/.env`,
publique as regras (se ainda não estiverem no ar) e rode `npm run deploy`:

```sh
firebase deploy --only firestore:rules --project repositorio-latics
npm run deploy
```

## Scripts de administração

Rodam localmente com as credenciais do gcloud (`gcloud auth application-default login`) e ignoram as Security Rules.

```sh
npm run seed                                  # grava o conteúdo de exemplo (scripts/dados-exemplo.ts)
npm run seed -- --force                       # idem, sobrescrevendo o que já existe
npm run promover -- email@exemplo.com admin   # define o papel: admin | editor | pendente
```

O primeiro administrador: crie a conta em `/admin/cadastro` e rode `npm run promover -- <seu-email> admin`.

## Deploy

```sh
npm run deploy                      # build + páginas de SEO + hosting (o caso comum)
firebase deploy --only firestore:rules,storage,firestore:indexes --project repositorio-latics   # regras e índices
```

`npm run deploy` roda `npm run paginas` (`scripts/gerar-paginas.ts`) depois do build: ele lê o Firestore e grava em `dist/`
um HTML por página pública, texto e tecnologia, com título, descrição e Open Graph próprios, além de `sitemap.xml` e
`robots.txt`. Isso faz as prévias de links (WhatsApp, redes sociais) e o sitemap funcionarem. Por isso, **textos
publicados pelo painel só ganham prévia e entrada no sitemap no deploy seguinte**; no navegador aparecem na hora.

Use sempre `--project repositorio-latics` nos comandos `firebase` (a pasta pai tem outro projeto ativo).
