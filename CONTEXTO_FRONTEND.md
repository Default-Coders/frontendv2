# Contexto do Frontend — Biblioteca Virtual

> Documento exclusivo da aplicação frontend.
>
> Atualizado em 8 de setembro de 2026.

## 1. Visão geral

O frontend da Biblioteca Virtual oferece uma área pública e duas áreas autenticadas:

- área pública, com vitrine pesquisável, detalhes do livro, login e recuperação de senha;

- área administrativa, para gerenciamento do acervo, categorias, usuários e reservas;
- área do aluno, para consulta do catálogo, reservas, fila de espera e perfil.

A interface está em português do Brasil, é responsiva e oferece temas claro e escuro.

## 2. Tecnologias

- Next.js 16 com App Router;
- React 19;
- TypeScript em modo estrito;
- Tailwind CSS 4;
- Lucide React para ícones;
- js-cookie para o indicador local de perfil;
- React-Toastify para notificações com tema claro/escuro;
- React Compiler habilitado.

## 3. Estrutura

```text
frontend/
├── public/
│   └── ete-logo.png
├── src/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── primeiro-acesso/page.tsx
│   │   ├── recuperar-senha/page.tsx
│   │   ├── vitrine/page.tsx
│   │   ├── livros/[id]/page.tsx
│   │   ├── admin/
│   │   │   ├── admins/page.tsx
│   │   │   ├── books/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── reservations/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   └── layout.tsx
│   │   ├── aluno/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── reservations/page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── confirm-toast.tsx
│   │   ├── pagination.tsx
│   │   ├── password-input.tsx
│   │   └── toast-provider.tsx
│   ├── hooks/
│   │   └── use-escape-key.ts
│   └── lib/
│       ├── api.ts
│       ├── auth.ts
│       ├── masks.ts
│       └── theme.ts
├── .env
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 4. Rotas e telas

| Rota | Perfil | Função da interface |
|---|---|---|
| `/` | Público | Vitrine paginada do acervo; reutiliza a página de `/vitrine`. |
| `/vitrine` | Público | Busca livros por título, autor, editora, ISBN ou categoria e exibe disponibilidade. |
| `/livros/:id` | Público | Detalhes do livro, capa, disponibilidade, metadados e descrição da categoria. |
| `/login` | Público | Login e redirecionamento por perfil ou para primeiro acesso. |
| `/recuperar-senha` | Público | Redefinição direta por e-mail, nova senha e confirmação. |
| `/primeiro-acesso` | Autenticado | Troca obrigatória da senha inicial antes de liberar as áreas internas. |
| `/admin/dashboard` | Administrador | Métricas e atalhos administrativos. |
| `/admin/admins` | Administrador | Cadastro, busca, edição, senha, ativação e desativação de administradores. |
| `/admin/books` | Administrador | Cadastro, edição, busca, estoque e desativação de livros. |
| `/admin/categories` | Administrador | Cadastro, edição, busca e exclusão de categorias. |
| `/admin/students` | Administrador | Cadastro, filtros, edição, senha, histórico e situação de alunos. |
| `/admin/reservations` | Administrador | Acompanhamento de reservas, retiradas, devoluções e fila. |
| `/aluno/dashboard` | Aluno | Catálogo, busca, filtro, reserva e entrada na fila. |
| `/aluno/reservations` | Aluno | Reservas e posições na fila do usuário. |
| `/aluno/profile` | Aluno | Consulta e alteração de perfil e senha. |

## 5. Layouts e navegação

### Área administrativa

O layout administrativo utiliza uma barra lateral fixa em telas médias e grandes e um menu sobreposto em dispositivos móveis. A navegação contém Dashboard, Livros, Categorias, Alunos, Administradores e Reservas.

### Área do aluno

O layout do aluno utiliza um cabeçalho responsivo. A navegação contém Catálogo, Minhas Reservas e Meu Perfil.

Os dois layouts incluem:

- logotipo `public/ete-logo.png`;
- destaque visual da rota ativa;
- alternância de tema;
- ação de logout;
- verificação client-side do perfil esperado.
- identificação do usuário autenticado pelo nome; o administrador também vê o e-mail.

## 6. Login e estado local

Após um login bem-sucedido, a interface salva perfil, nome, e-mail e o indicador de primeiro acesso nos cookies client-side `user_role`, `user_name`, `user_email` e `first_login`. Os valores de perfil reconhecidos são:

- `ROLE_ADMIN`;
- `ROLE_STUDENT`.

O perfil é usado pelos layouts para direcionar a navegação. Se `first_login=true`, o login e os layouts encaminham para `/primeiro-acesso`; após a troca bem-sucedida, o cookie é atualizado e o usuário segue para seu dashboard. Dados sensíveis e senhas não são armazenados pelo frontend.

O utilitário `src/lib/auth.ts` centraliza:

- `setAuthData`;
- `clearAuthData`;
- `getUserRole`;
- `getUserName`;
- `getUserEmail`;
- `isFirstLogin`;
- `completeFirstLogin`;
- `isAuthenticated`.

Quando uma requisição recebe `401`, `src/lib/api.ts` limpa todos os indicadores locais e direciona o navegador para `/`. Respostas `403` são exibidas como erro e não executam esse redirecionamento automático.

### 6.1 Login, primeiro acesso e recuperação

- o login envia e-mail e senha com `credentials: "include"`, grava os metadados retornados e redireciona por `ROLE_ADMIN` ou `ROLE_STUDENT`;
- o campo de senha possui controle acessível para exibir ou ocultar o conteúdo;
- a primeira troca exige senha atual, nova senha com pelo menos 6 caracteres e confirmação; a interface impede senha nova igual à atual;
- a recuperação valida confirmação e mínimo de 6 caracteres, chama `/auth/recover-password` e apresenta uma tela de sucesso com retorno ao login;
- atualmente o botão “Faça seu cadastro” exibido no login não possui ação associada.

## 7. Comunicação HTTP

A URL base consumida pela interface é definida por:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.220:8080/api
```

O utilitário `apiFetch`:

- acrescenta a URL base ao endpoint;
- envia JSON por padrão;
- utiliza `credentials: "include"`;
- transforma respostas não bem-sucedidas em `Error`;
- aceita respostas sem conteúdo com status `204`;
- executa o tratamento centralizado de `401`;
- envia `FormData` sem definir manualmente o `Content-Type`, permitindo uploads de capas.

## 7.1 Capas e recursos locais

A Gestão de Livros permite adicionar, substituir e remover capas JPEG, PNG ou WebP de até 2 MB. A listagem administrativa mostra miniaturas e o catálogo do aluno usa `next/image`, preservando a proporção completa da capa com placeholder para livros sem imagem. `assetUrl` transforma o caminho relativo retornado pela API em uma URL acessível.

No backend, as capas são servidas em `/uploads/covers`. O Docker usa o volume nomeado `capas_biblioteca`, montado em `/aplicacao/uploads`, para preservar arquivos entre reconstruções.

## 7.2 Notificações

O `ToastProvider` global observa a classe `dark` do elemento `<html>` e alterna o tema do React-Toastify imediatamente. As telas administrativas e de reservas usam toasts para mensagens de sucesso e erro. `confirmToast` cria confirmações persistentes com ações Cancelar/Confirmar para operações como desativação, exclusão, retirada, devolução e cancelamento.

Como variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle, qualquer alteração em `.env` exige nova compilação quando a aplicação estiver usando `npm run start`.

## 7.3 Vitrine pública e detalhes

- `/` exporta a mesma tela de `/vitrine`;
- a vitrine consome `/public/books`, pesquisa no cliente por título, autor, editora, ISBN e categoria e pagina 4 livros por vez;
- cada cartão mostra capa ou placeholder, categoria, título, autor, ISBN formatado e disponibilidade;
- `Escape` limpa uma pesquisa ativa e a paginação volta ao início quando o texto muda;
- `/livros/:id` consome o detalhe público e mostra capa, autor, editora, ano, ISBN, categoria, descrição, quantidade disponível e total;
- as páginas públicas possuem alternância de tema e acesso ao login.

## 7.4 Componentes e comportamentos reutilizáveis

- `Pagination` mostra intervalo e total, páginas numeradas, reticências e botões anterior/próximo; `paginate` recorta os itens no cliente;
- `PasswordInput` alterna entre senha oculta e visível com rótulos ARIA;
- `useEscapeKey` fecha o modal prioritário aberto em cada tela ou limpa a pesquisa da vitrine;
- formulários e ações bloqueiam seus botões durante salvamento para reduzir envios duplicados;
- telas apresentam estados de carregamento, lista vazia e erro em estilos compatíveis com os dois temas.

## 8. Funcionalidades administrativas

### 8.1 Dashboard

Carrega em paralelo livros, alunos, categorias, reservas e fila. Exibe cartões de totais, reservas pendentes, empréstimos ativos e fila, além de atalhos para livros e circulação. Falhas individuais são convertidas em listas vazias para manter a página disponível.

### 8.2 Administradores

- busca por nome/e-mail, filtro por ativo/inativo e paginação de 10 itens;
- cadastro com senha temporária aleatória, exibida uma única vez ao administrador, e primeiro acesso obrigatório;
- edição de nome/e-mail, redefinição de senha e visualização do estado do primeiro acesso;
- desativação e reativação com confirmação e retorno por toast.

### 8.3 Alunos

- busca e filtros de situação, curso e turma, com paginação de 10 itens;
- cadastro de aluno ou administrador a partir da mesma área;
- edição dos dados escolares e pessoais, redefinição de senha, desativação e reativação;
- indicador de primeiro acesso;
- modal de histórico que reúne as reservas e entradas na fila do aluno, com seus estados e datas.

### 8.4 Categorias

- listagem, pesquisa por nome e paginação de 6 itens;
- criação e edição de nome/descrição;
- desativação lógica;
- exclusão permanente com aviso explícito e confirmação, sujeita às regras de vínculo do backend.

### 8.5 Livros

- busca no cliente e paginação de 5 itens;
- criação e edição de título, autor, editora, ISBN, ano, quantidade total e categoria;
- ISBN formatado durante a digitação;
- miniatura e link para a página pública de detalhes;
- envio ou substituição da capa junto ao cadastro/edição, e remoção independente da imagem;
- ajuste separado do estoque total e desativação lógica com confirmação.

### 8.6 Reservas e fila

A tela possui abas independentes de reservas e lista de espera, cartões de métricas, busca, filtros e paginação de 5 itens.

Reservas:

- filtro por status e busca por aluno, livro ou ISBN;
- retirada para itens `REQUESTED` e devolução para `PICKED_UP`, ambas com confirmação;
- edição da data da reserva e do prazo de retirada;
- desativação lógica ou exclusão permanente com confirmação.

Fila:

- carrega também registros inativos e permite filtrar por atividade;
- busca por aluno, livro ou ISBN;
- edição de data e posição, com aviso sobre reordenação;
- desativação lógica ou exclusão permanente com confirmação.

## 9. Funcionalidades do aluno

### 9.1 Catálogo autenticado

- carrega livros e categorias, pesquisa por título, autor ou ISBN e filtra por categoria;
- pagina 5 livros, exibe capa, estoque e link para detalhes;
- com exemplar disponível, cria reserva; sem disponibilidade, oferece entrada na fila;
- bloqueia a ação individual enquanto a requisição está em andamento e atualiza o catálogo após sucesso.

### 9.2 Minhas reservas

- apresenta reservas e fila em seções separadas, ambas paginadas em 6 itens;
- traduz os estados persistidos para rótulos e cores;
- permite cancelar reserva apenas em `REQUESTED`;
- permite sair da fila em `WAITING` ou `NOTIFIED`, sempre com confirmação.

### 9.3 Meu perfil

- consulta e edita nome, telefone, curso e turma; o e-mail é exibido, mas preservado pelo backend;
- aplica máscara de telefone;
- altera senha após validar senha atual, nova senha, confirmação e mínimo de 6 caracteres;
- usa estados independentes de salvamento para perfil e senha.

## 10. Tema e estilos

O tema usa a classe `dark` no elemento `<html>`. A preferência é armazenada em `localStorage` com a chave `biblioteca-theme`, mantendo leitura da chave legada `theme`.

Na primeira renderização, a interface:

1. procura uma preferência salva;
2. usa a preferência do sistema quando não existe valor salvo;
3. aplica o esquema antes de renderizar o conteúdo, reduzindo mudanças visuais durante o carregamento.

As cores globais e os estilos da barra de rolagem estão em `src/app/globals.css`.

## 11. Máscaras de entrada

`src/lib/masks.ts` contém funções puras para:

- manter somente dígitos;
- formatar telefone com 10 ou 11 dígitos;
- formatar ISBN-10 e ISBN-13.

## 12. Configuração de rede

Os scripts `dev` e `start` usam `-H 0.0.0.0`, permitindo acesso por outras máquinas da mesma rede.

Endereços atuais:

```text
Local: http://localhost:3000
Rede:  http://192.168.1.220:3000
```

`next.config.ts` inclui `192.168.1.220` em `allowedDevOrigins` para desenvolvimento pela rede.

## 13. Execução

Instale as dependências:

```powershell
npm install
```

Desenvolvimento:

```powershell
npm run dev
```

Produção local:

```powershell
npm run build
npm run start
```

Não execute `dev` e `start` ao mesmo tempo, pois ambos tentam utilizar a porta `3000`.

## 14. Scripts

| Script | Função |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento em `0.0.0.0`. |
| `npm run build` | Compila e valida a aplicação. |
| `npm run start` | Serve o build de produção em `0.0.0.0`. |
| `npm run lint` | Executa o ESLint. |

## 15. Validação antes de entregar

Execute:

```powershell
npm run lint
npm run build
```

Valide manualmente:

- login e logout;
- redirecionamento para o perfil correto;
- menus desktop e móvel;
- temas claro e escuro;
- formulários e mensagens de retorno;
- acesso local e pela rede;
- atualização das métricas;
- reserva, cancelamento, retirada e devolução nas telas correspondentes.

Estado validado em 8 de setembro de 2026:

- build de produção do Next.js: aprovado;
- TypeScript: aprovado;
- geração das 15 rotas listadas e da página de erro: aprovada;
- ESLint: nenhum erro e um aviso em `src/lib/api.ts` pelo uso de `window.location.href` no redirecionamento após `401`.

## 16. Pontos de atenção

- A proteção de perfil nos layouts é client-side.
- O cookie `user_role` auxilia apenas a interface e não deve ser tratado como autorização.
- Chamadas paralelas que usam `.catch(() => [])` podem ocultar falhas e exibir listas vazias.
- O botão de atualização da dashboard atualmente permite novos cliques enquanto uma atualização está em andamento.
- Mudanças em imagens podem exigir atualização forçada do navegador devido ao cache.
- Alterações em `.env` exigem recompilação no modo de produção.
- A recuperação pública de senha está desativada até que o backend ofereça um fluxo seguro com token de uso único enviado por e-mail. Redefinições feitas por administrador enviam a senha temporária ao endereço já cadastrado e informam na interface se o envio SMTP foi aceito.
- O cadastro público anunciado pelo botão “Faça seu cadastro” ainda não está implementado.
