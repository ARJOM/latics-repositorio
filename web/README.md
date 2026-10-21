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
npm run build
firebase deploy                     # hosting + regras + índices
firebase deploy --only hosting      # só o site
firebase deploy --only firestore:rules,storage   # só as regras
```
