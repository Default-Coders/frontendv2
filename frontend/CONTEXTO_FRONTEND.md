# Contexto e Arquitetura do Frontend — Biblioteca Virtual ETE

Documentação da arquitetura, fluxo visual, estados, rotas e componentes do frontend.

---

## 1. Visão Geral

O frontend da Biblioteca Virtual ETE oferece uma experiência moderna de autoatendimento para estudantes e um sistema administrativo completo para os gestores da biblioteca da Escola Técnica Estadual (ETE).

---

## 2. Pilares Visuais e de UX

1. **Favicon e Identidade Visual da ETE**:
   - Ícone do navegador e marca 100% personalizados com a logo oficial da ETE (sem símbolos ou logotipos do Next.js/Vercel).
2. **Landing Page com Transição em Três Estágios**:
   - **Logo / Apresentação**: Destaque para a marca da ETE com botão/scroll para continuar.
   - **Boas-Vindas**: Apresentação dos recursos do acervo.
   - **Autenticação**: Acessado exclusivamente via clique no botão *"Acessar o Sistema"*, liberando o card de Login e Cadastro sem interferir no scroll.
3. **Notificações Animadas Globais (`react-toastify`)**:
   - Feedback visual instantâneo para todas as ações do sistema (sucesso, aviso, erro).
4. **Diálogos de Confirmação Personalizados (`ConfirmModal`)**:
   - Substituição total dos alertas nativos do navegador (`confirm`), eliminando mensagens como `localhost:3000 diz` e permitindo fechar ao clicar em qualquer lugar fora do modal.
5. **Tema Claro / Escuro (Dark Mode)**:
   - Suporte completo com script de inicialização que evita oscilações de tela (*flash*).

---

## 3. Estrutura de Rotas e Telas (App Router)

### 3.1. Pública
- **`/`**: Landing Page (Intro da ETE -> Boas-Vindas -> Login e Cadastro).

### 3.2. Painel Administrativo (`/admin/*`)
- **`/admin/dashboard`**: Métricas e estatísticas do acervo.
- **`/admin/administradores`**: Gestão de contas de administradores.
- **`/admin/alunos`**: Cadastro, edição, reativação e desativação de estudantes.
- **`/admin/categorias`**: Criação, edição e exclusão de categorias.
- **`/admin/livros`**: Catálogo completo, gestão de capas e ajuste de estoque.
- **`/admin/reservas`**: Controle global de solicitações, retiradas e devoluções.

### 3.3. Painel do Aluno (`/aluno/*`)
- **`/aluno/dashboard`**: Pesquisa no acervo escolar e solicitação de reserva/fila.
- **`/aluno/reservas`**: Minhas reservas ativas e posição na lista de espera.
- **`/aluno/perfil`**: Atualização de dados pessoais e alteração de senha.

---

## 4. Integração com a API Backend

O client REST (`src/lib/api.ts`) consome as seguintes rotas da API em NestJS:

- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- Alunos: `GET|POST|PUT|DELETE /api/students`, `PATCH /api/students/:id/reactivate`, `PATCH /api/students/:id/password`
- Livros: `GET|POST|PUT|DELETE /api/books`, `PATCH /api/books/:id/stock`, `POST|DELETE /api/books/:id/cover`
- Categorias: `GET|POST|PUT|DELETE /api/categories`
- Reservas: `GET|POST /api/reservations`, `PATCH /api/reservations/:id/pickup`, `PATCH /api/reservations/:id/return`
- Lista de Espera: `GET|POST|PATCH /api/waiting-list`

---

## 5. Scripts de Execução

```powershell
# Executar em ambiente de desenvolvimento
npm run dev

# Compilar para produção
npm run build
npm run start
```
