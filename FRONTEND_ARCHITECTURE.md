# Arquitetura e Design do Frontend Multi-Tenant

## 1. Visão Geral do Projeto

Este é o frontend de uma aplicação SaaS multi-tenant que gerencia clientes e vendas. A interface deve ser profissional, intuitiva e refletir a segurança e robustez da API backend que construímos.

## 2. Decisões de Design Visual

### Paleta de Cores
- **Primária**: Azul profissional (`#2563EB`) - transmite confiança e profissionalismo
- **Secundária**: Cinza neutro (`#6B7280`) - para elementos secundários
- **Sucesso**: Verde (`#10B981`) - para ações bem-sucedidas
- **Aviso**: Âmbar (`#F59E0B`) - para avisos e atenções
- **Erro**: Vermelho (`#EF4444`) - para erros e ações destrutivas
- **Fundo**: Branco/Cinza claro - interface limpa e profissional

### Tipografia
- **Display/Títulos**: Fonte sem-serifa moderna (usar Google Fonts: `Poppins` ou `Outfit`)
- **Corpo**: Fonte sem-serifa legível (`Inter` ou `Roboto`)
- **Monospace**: Para dados técnicos e tokens

### Componentes Principais
- **Sidebar**: Navegação persistente com ícones e labels
- **Header**: Barra superior com informações do usuário e tenant ativo
- **Cards**: Para exibir dados de clientes e vendas
- **Tabelas**: Para listagens com paginação e filtros
- **Modais**: Para criar/editar registros
- **Formulários**: Validação em tempo real com feedback visual

## 3. Arquitetura de Componentes React

```
client/src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui customizados
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── DashboardLayout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── clients/
│   │   ├── ClientList.tsx
│   │   ├── ClientForm.tsx
│   │   └── ClientCard.tsx
│   ├── sales/
│   │   ├── SalesList.tsx
│   │   ├── SaleForm.tsx
│   │   └── SaleCard.tsx
│   └── admin/
│       ├── TenantProvisioning.tsx
│       ├── RoleManagement.tsx
│       └── AdminDashboard.tsx
├── contexts/
│   ├── AuthContext.tsx        # Gerencia autenticação e token JWT
│   ├── TenantContext.tsx      # Gerencia tenant ativo
│   └── ThemeContext.tsx       # Gerencia tema (já existe)
├── hooks/
│   ├── useAuth.ts             # Hook customizado para autenticação
│   ├── useTenant.ts           # Hook para tenant
│   └── useApi.ts              # Hook para chamadas à API
├── lib/
│   ├── api.ts                 # Configuração do axios/fetch para API
│   ├── auth.ts                # Funções de autenticação
│   └── constants.ts           # Constantes (URLs, etc)
├── pages/
│   ├── Home.tsx               # Dashboard principal
│   ├── Login.tsx              # Página de login
│   ├── Register.tsx           # Página de registro
│   ├── Clients.tsx            # Página de clientes
│   ├── Sales.tsx              # Página de vendas
│   ├── Admin.tsx              # Página de administração
│   └── NotFound.tsx           # Página 404
├── App.tsx                    # Roteamento principal
├── main.tsx                   # Entry point
└── index.css                  # Estilos globais
```

## 4. Fluxo de Autenticação

### Contexto de Autenticação (`AuthContext.tsx`)
- Armazena token JWT, informações do usuário e role
- Fornece funções para login, registro e logout
- Persiste dados no localStorage para manter sessão

### Proteção de Rotas
- `ProtectedRoute`: Redireciona para login se não autenticado
- `AdminRoute`: Redireciona se o usuário não tem role "Admin"

### Fluxo de Login
1. Usuário acessa `/login`
2. Preenche formulário com email e senha
3. Envia requisição `POST /api/auth/login` para backend
4. Recebe token JWT
5. Armazena token em contexto e localStorage
6. Redireciona para dashboard

## 5. Estrutura de Rotas

```
/                          → Dashboard (requer autenticação)
/login                     → Página de login
/register                  → Página de registro
/clients                   → Lista de clientes
/clients/:id               → Detalhes do cliente
/sales                     → Lista de vendas
/sales/:id                 → Detalhes da venda
/admin                     → Dashboard administrativo (requer role Admin)
/admin/tenants             → Gerenciamento de tenants
/admin/roles               → Atribuição de roles
/404                       → Página não encontrada
```

## 6. Integração com API Backend

### Configuração do Cliente HTTP
- Usar `axios` com interceptadores para adicionar token JWT automaticamente
- Adicionar header `X-Tenant-ID` em todas as requisições

### Exemplo de Interceptador
```typescript
// Adiciona token JWT e tenant ID a cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  return config;
});
```

## 7. Plano de Implementação

### Fase 1: Autenticação (Login/Registro)
- Criar páginas de login e registro
- Implementar contexto de autenticação
- Criar hooks customizados para autenticação
- Proteger rotas

### Fase 2: Layout Base
- Criar sidebar com navegação
- Criar header com informações do usuário
- Implementar layout dashboard

### Fase 3: Gestão de Clientes
- Listar clientes com paginação
- Criar formulário para novo cliente
- Editar cliente existente
- Deletar cliente

### Fase 4: Gestão de Vendas
- Listar vendas com filtros
- Criar formulário para nova venda
- Editar venda existente
- Deletar venda

### Fase 5: Dashboard Administrativo
- Provisionar novos tenants
- Atribuir roles aos usuários
- Visualizar estatísticas

## 8. Componentes Reutilizáveis

Todos os componentes de formulário, tabela e card devem ser reutilizáveis e customizáveis através de props. Usar shadcn/ui como base para garantir consistência.

## 9. Tratamento de Erros

- Exibir toasts (usando `sonner`) para feedback de sucesso/erro
- Validação de formulários em tempo real
- Mensagens de erro claras e acionáveis
- Retry automático para requisições que falharem

## 10. Performance

- Lazy loading de rotas
- Memoização de componentes quando necessário
- Paginação para listas grandes
- Cache de dados quando apropriado
