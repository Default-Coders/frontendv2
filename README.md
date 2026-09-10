# Frontend — Biblioteca Virtual

Interface web da Biblioteca Virtual da ETE, construída com Next.js, React, TypeScript e Tailwind CSS.

## Credenciais iniciais

A conta administrativa inicial usa uma senha temporária aleatória. Ela é enviada pelo serviço de e-mail quando o SMTP está configurado e nunca é registrada no código ou nos logs. Contas criadas pelo painel exibem a senha temporária uma única vez ao administrador responsável pelo cadastro.

## Requisitos

- Node.js compatível com Next.js 16;
- npm;
- serviço HTTP configurado em `NEXT_PUBLIC_API_URL` disponível.

## Configuração

Defina a URL consumida pelo frontend no arquivo `.env`:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.220:8080/api
```

Para uso exclusivamente local, pode ser utilizado:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Instalação e execução

```powershell
npm install
npm run dev
```

Acesse:

```text
Local: http://localhost:3000
Rede:  http://192.168.1.220:3000
```

## Build de produção

```powershell
npm run build
npm run start
```

Após alterar `.env`, execute novamente `npm run build` antes de usar `npm run start`.

## Verificações

```powershell
npm run lint
npm run build
```

## Documentação

Consulte [CONTEXTO_FRONTEND.md](./CONTEXTO_FRONTEND.md) para conhecer a estrutura, as rotas, os utilitários e o comportamento da interface.
