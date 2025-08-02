# 📚 LearnHub - Plataforma de Gestão Acadêmica e Pessoal

<div align="center">
  <img src="public/logo192.png" alt="LearnHub Logo" width="100" height="100">
  
  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-11.5.0-orange.svg)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
</div>

## 📋 Sobre o Projeto

O **LearnHub** é uma plataforma completa de gestão acadêmica e pessoal desenvolvida em React, projetada para ajudar estudantes a organizarem seus estudos, planejamentos, finanças, projetos e bem-estar de forma integrada e intuitiva.

### 🎯 Objetivo

Centralizar todas as ferramentas necessárias para um estudante gerenciar eficientemente sua vida acadêmica e pessoal em uma única plataforma moderna e responsiva.

## ✨ Principais Funcionalidades

### 🏠 Dashboard Inteligente
- **Resumo personalizado** com dados consolidados de todos os módulos
- **Indicadores visuais** de progresso e metas
- **Interface moderna** com tema customizável (claro/escuro)
- **Navegação intuitiva** entre módulos

### 📅 Gestão de Tempo e Planejamento
- **Agenda integrada** com calendário interativo
- **Sistema de planejamento** com metas e objetivos
- **Formulários dinâmicos** para adicionar e editar planejamentos
- **Visualização de cronogramas** e prazos

###  Controle Financeiro
- **Gestão de receitas e despesas**
- **Categorização automática** de gastos
- **Relatórios financeiros** detalhados
- **Metas de economia** e orçamento

### 🚀 Gestão de Projetos
- **Criação e acompanhamento** de projetos pessoais e acadêmicos
- **Sistema de status** e progresso
- **Documentação integrada** de projetos
- **Timeline de desenvolvimento**

### 📖 Biblioteca de Leituras
- **Catálogo pessoal** de livros e materiais
- **Sistema de avaliação** e resenhas
- **Progresso de leitura** e metas
- **Recomendações personalizadas**

### 🏥 Monitoramento de Saúde
- **Registro de atividades físicas**
- **Acompanhamento de hábitos saudáveis**
- **Histórico de saúde** e bem-estar
- **Lembretes e notificações**

### 📋 Sistema de Hábitos
- **Criação de rotinas** personalizadas
- **Tracking diário** de hábitos
- **Estatísticas de consistência**
- **Gamificação** para motivação

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.0.0** - Biblioteca principal para interface
- **React Router DOM 7.2.0** - Navegação entre páginas
- **React Icons 5.5.0** - Iconografia moderna
- **Lucide React 0.486.0** - Ícones adicionais
- **Framer Motion 12.4.10** - Animações fluidas
- **React Calendar 5.1.0** - Componente de calendário

### Backend e Dados
- **Firebase 11.5.0** - Autenticação e banco de dados
- **Express 4.21.2** - Servidor backend
- **Express Session 1.18.1** - Gerenciamento de sessões
- **Axios 1.8.1** - Requisições HTTP

### Ferramentas de Desenvolvimento
- **CRACO 7.1.0** - Configuração customizada do Create React App
- **React Scripts 5.0.1** - Scripts de build e desenvolvimento
- **Testing Library** - Suite completa de testes
- **ESLint** - Linting e qualidade de código

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** (versão 16.0.0 ou superior)
- **npm** ou **yarn**
- **Git**

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/learnhub.git
cd learnhub
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Configure as credenciais em `src/firebase-config.js`
   - Ative Authentication e Firestore Database

4. **Execute o projeto**
```bash
npm start
```

O aplicativo será aberto em [http://localhost:3000](http://localhost:3000)

### Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm start

# Executa os testes
npm test

# Gera build de produção
npm run build

# Ejeta as configurações (irreversível)
npm run eject
```

## 📁 Estrutura do Projeto

```
learnhub/
├── public/                 # Arquivos públicos
│   ├── index.html         # Template HTML principal
│   ├── manifest.json      # Configuração PWA
│   └── sw.js             # Service Worker
├── src/
│   ├── components/        # Componentes React
│   │   ├── Dashboard.js   # Dashboard principal
│   │   ├── Agenda.js      # Componente de agenda
│   │   ├── Financas.js    # Controle financeiro
│   │   ├── Projetos.js    # Gestão de projetos
│   │   ├── Leituras.js    # Biblioteca de leituras
│   │   ├── Saude.js       # Monitoramento de saúde
│   │   ├── Habitos.js     # Sistema de hábitos
│   │   └── ...
│   ├── pages/             # Páginas da aplicação
│   │   ├── Home/          # Página inicial
│   │   ├── Login/         # Sistema de login
│   │   ├── Cadastros/     # Cadastros de usuário
│   │   └── ...
│   ├── context/           # Contextos React
│   │   ├── AuthContext.js # Autenticação
│   │   └── ThemeContext.js # Temas
│   ├── services/          # Serviços externos
│   ├── hooks/             # Hooks customizados
│   ├── utils/             # Utilitários
│   └── styles/            # Estilos globais
└── package.json
```

## 🔐 Autenticação e Segurança

- **Sistema de login** com Firebase Authentication
- **Rotas protegidas** para usuários autenticados
- **Validação de dados** no frontend e backend
- **Sessões seguras** com Express Session

## 📱 Responsividade

O LearnHub é totalmente responsivo e otimizado para:
- 📱 **Mobile** (smartphones)
- 📟 **Tablet** (tablets)
- 💻 **Desktop** (computadores)

## 🎨 Temas e Personalização

- **Tema claro** e **escuro** disponíveis
- **Personalização de cores** por módulo
- **Interface adaptativa** baseada nas preferências do usuário
- **Acessibilidade** seguindo padrões WCAG

## 🧪 Testes

```bash
# Executa todos os testes
npm test

# Executa testes em modo watch
npm test -- --watch

# Executa testes com coverage
npm test -- --coverage
```

## 🚀 Deploy

### Netlify
```bash
npm run build
# Upload da pasta build/ para o Netlify
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Como Contribuir

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Escreva testes para novas funcionalidades
- Documente mudanças significativas
- Use commits semânticos (conventional commits)

## 📊 Roadmap

- [ ] **v1.1** - Sistema de notificações push
- [ ] **v1.2** - Integração com Google Calendar
- [ ] **v1.3** - Modo offline com sincronização
- [ ] **v1.4** - API REST completa
- [ ] **v1.5** - Aplicativo mobile nativo
- [ ] **v2.0** - Inteligência artificial para recomendações

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/seu-usuario/learnhub/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Informações do ambiente (SO, navegador, etc.)

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seu-usuario)

## 📞 Contato

- **Email**: seuemail@exemplo.com
- **LinkedIn**: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)
- **GitHub**: [Seu GitHub](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Create React App](https://create-react-app.dev/) - Base do projeto
- [Firebase](https://firebase.google.com/) - Backend e autenticação
- [React Icons](https://react-icons.github.io/react-icons/) - Iconografia
- [Framer Motion](https://www.framer.com/motion/) - Animações

---

<div align="center">
  Feito com ❤️ para estudantes que buscam organização e produtividade
</div>
