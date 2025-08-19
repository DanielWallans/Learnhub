# 📚 LearnHub - Sua vida acadêmica organizada em um só lugar!

<div align="center">
  <img src="public/logo192.png" alt="LearnHub Logo" width="100" height="100">
  
  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-11.5.0-orange.svg)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
</div>

## 📋 O que é isso?

Bom, o **LearnHub** nasceu da minha frustração de ter mil apps diferentes pra tentar me organizar na faculdade 😅. Cansei de ficar pulando entre agenda, planilha de gastos, lista de livros pra ler... então resolvi criar uma coisa só que juntasse tudo!

É basicamente um "canivete suíço" para estudantes - tem agenda, controle financeiro, lista de projetos, biblioteca pessoal e até um tracker de hábitos (porque a gente sempre tenta ser mais saudável, né? 😄).

### 🎯 A ideia por trás

Queria algo que realmente funcionasse no dia a dia, sem frescura. Uma plataforma onde você consegue ver tudo de uma vez - suas próximas provas, quanto gastou no mês, que livro tá lendo... sabe como é, vida de estudante é corrida!

## ✨ O que tem aqui dentro?

### 🏠 Dashboard (a tela principal)
Aqui é onde a mágica acontece! Você abre e já vê tudo que importa:
- Um resumão de como andam as coisas em cada área da sua vida
- Uns gráficos bonitinhos pra você se sentir produtivo 📊
- Tema escuro pra quem gosta de codar de madrugada (eu sei como é...)
- Navegação super simples - clicou, foi!

### 📅 Agenda e Planejamento
Chega de esquecer prova e entrega de trabalho:
- Calendário que funciona de verdade (não é só bonito)
- Você pode planejar desde "estudar pra prova" até "dominar o mundo"
- Adiciona, edita, remove... tudo bem fácil
- Visualiza seus prazos sem ter um ataque de pânico

### 💰 Suas Finanças (ou o que sobrou delas)
Porque ramen todo dia não é vida:
- Controla onde seu dinheiro tá indo (spoiler: delivery e café)
- Categoriza os gastos automaticamente
- Relatórios que mostram a dura realidade 📉
- Metas de economia (a gente tenta, né?)

### 🚀 Projetos
Pra organizar aqueles projetos que você jura que vai terminar:
- Cria e acompanha projetos pessoais e da faculdade
- Status tipo "fazendo", "pausado", "desisti" (honestidade é tudo)
- Documenta tudo pra não esquecer o que você tava pensando
- Timeline pra ver como você (não) tá progredindo

### 📖 Biblioteca Pessoal
Pra quem gosta de ler (ou pelo menos tenta):
- Seu catálogo pessoal de livros e PDFs
- Sistema de notas e resenhas ("esse livro é chato" é uma resenha válida)
- Acompanha quantas páginas você leu (ou fingiu que leu)
- Recomendações baseadas no que você curte

### 🏥 Cuidando da Saúde (porque Netflix não conta como exercício)
Pra tentar manter o corpo funcionando:
- Registra suas atividades físicas (subir escada conta!)
- Acompanha hábitos saudáveis (beber água, dormir cedo...)
- Histórico de como você tá se cuidando
- Lembretes chatos mas necessários

### 📋 Hábitos
Pra criar aquelas rotinas que você sempre quis ter:
- Cria rotinas personalizadas ("não procrastinar" é um hábito válido)
- Tracking diário - marca um X quando fez
- Estatísticas pra ver se você tá consistente ou só fingindo
- Sistema de pontos pra te motivar (funciona, juro!)

## 🛠️ Tecnologias (o que tem por baixo do capô)

### Frontend (a parte bonita)
- **React 19.0.0** - A base de tudo, porque React é vida
- **React Router DOM 7.2.0** - Pra navegar sem recarregar a página
- **React Icons 5.5.0** - Ícones bonitinhos
- **Lucide React 0.486.0** - Mais ícones ainda (nunca são demais)
- **Framer Motion 12.4.10** - Animações que fazem tudo parecer profissional
- **React Calendar 5.1.0** - Calendário que não dá dor de cabeça

### Backend (onde a mágica acontece)
- **Firebase 11.5.0** - Google cuida dos dados pra gente
- **Express 4.21.2** - Servidor simples e direto
- **Express Session 1.18.1** - Pra lembrar quem você é
- **Axios 1.8.1** - Faz as requisições HTTP sem drama

### Ferramentas de Dev (pra não surtar programando)
- **CRACO 7.1.0** - Customiza o Create React App sem ejetar
- **React Scripts 5.0.1** - Os scripts que fazem tudo funcionar
- **Testing Library** - Testes pra ter certeza que não quebrou nada
- **ESLint** - Pra manter o código organizado (e me irritar com ponto e vírgula)

## 🚀 Como rodar essa belezinha

### O que você precisa ter instalado

- **Node.js** (versão 16 pra cima - se não tem, baixa no site oficial)
- **npm** ou **yarn** (vem junto com o Node, relaxa)
- **Git** (pra clonar o repositório)

### Colocando pra funcionar

1. **Baixa o código**
```bash
git clone https://github.com/seu-usuario/learnhub.git
cd learnhub
```

2. **Instala as paradas**
```bash
npm install
```
(Vai demorar um pouquinho, aproveita pra pegar um café ☕)

3. **Configura o Firebase** (a parte chata mas necessária)
   - Vai no [Firebase Console](https://console.firebase.google.com/) e cria um projeto
   - Pega as credenciais e cola no `src/firebase-config.js`
   - Ativa o Authentication e o Firestore Database (é só clicar nos botões)

4. **Roda o projeto**
```bash
npm start
```

Se tudo deu certo, vai abrir no [http://localhost:3000](http://localhost:3000) e você vai ver a tela de login!

### Comandos úteis

```bash
# Roda o projeto em modo desenvolvimento
npm start

# Roda os testes (se você for do tipo que testa as coisas)
npm test

# Gera a versão final pra colocar no ar
npm run build

# Ejeta as configurações (NÃO FAÇA ISSO a menos que saiba o que tá fazendo!)
npm run eject
```

## 📁 Como tá organizado

Basicamente, a estrutura é assim (não se assuste, é mais simples do que parece):

```
learnhub/
├── public/                 # Coisas públicas (favicon, manifest...)
│   ├── index.html         # O HTML principal
│   ├── manifest.json      # Configuração pra virar PWA
│   └── sw.js             # Service Worker (pra funcionar offline)
├── src/                   # Aqui que mora o código de verdade
│   ├── components/        # Componentes React
│   │   ├── Dashboard.js   # A tela principal
│   │   ├── Agenda.js      # Calendário e compromissos
│   │   ├── Financas.js    # Onde seu dinheiro some
│   │   ├── Projetos.js    # Seus projetos (terminados ou não)
│   │   ├── Leituras.js    # Biblioteca pessoal
│   │   ├── Saude.js       # Tracking de saúde
│   │   ├── Habitos.js     # Hábitos que você quer criar
│   │   └── ...            # E outros componentes
│   ├── pages/             # As páginas da aplicação
│   │   ├── Home/          # Página inicial
│   │   ├── Login/         # Tela de login
│   │   ├── Cadastros/     # Cadastro de usuário
│   │   └── ...            # Outras páginas
│   ├── context/           # Contextos React (estado global)
│   │   ├── AuthContext.js # Quem tá logado
│   │   └── ThemeContext.js # Tema claro/escuro
│   ├── services/          # Integrações externas
│   ├── hooks/             # Hooks customizados
│   ├── utils/             # Funções úteis
│   └── styles/            # CSS global
└── package.json           # Dependências e scripts
```

## 🔐 Segurança (porque ninguém quer ser hackeado)

- **Login com Firebase** - Google cuida da segurança pra gente
- **Rotas protegidas** - só entra quem tá logado
- **Validação de dados** - não aceita qualquer coisa
- **Sessões seguras** - você não precisa fazer login toda hora

## 📱 Funciona em tudo

O LearnHub roda bem em:
- 📱 **Celular** (testado no meu iPhone velho)
- 📟 **Tablet** (iPad, Android, essas coisas)
- 💻 **Computador** (Windows, Mac, Linux... tudo)

A interface se adapta sozinha, então não importa o tamanho da tela!

## 🎨 Temas (porque todo mundo tem suas preferências)

- **Tema claro** pra quem gosta de claridade
- **Tema escuro** pra quem programa de madrugada (como eu)
- **Cores personalizáveis** em cada módulo
- **Interface que se adapta** às suas preferências
- **Acessibilidade** pra todo mundo conseguir usar

## 🧪 Testes (pra ter certeza que funciona)

```bash
# Roda todos os testes
npm test

# Roda os testes e fica observando mudanças
npm test -- --watch

# Roda os testes e mostra cobertura
npm test -- --coverage
```

(Confesso que ainda preciso escrever mais testes... 😅)

## 🚀 Colocando no ar (deploy)

### Netlify (o mais fácil)
```bash
npm run build
# Arrasta a pasta build/ pro site do Netlify e pronto!
```

### Vercel (também bem simples)
```bash
npm install -g vercel
vercel --prod
```

### Firebase Hosting (se você quer usar tudo Google)
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Quer contribuir? Massa!

Se você quiser ajudar a melhorar o projeto:

1. **Faz um fork** do projeto
2. Cria uma **branch** nova (`git checkout -b minha-feature-incrivel`)
3. **Commita** suas mudanças (`git commit -m 'Adicionei uma coisa legal'`)
4. **Faz push** da branch (`git push origin minha-feature-incrivel`)
5. Abre um **Pull Request** explicando o que você fez

### Algumas regrinhas básicas

- Tenta seguir o estilo de código que já tá lá
- Se fizer algo novo, escreve uns testes (ou pelo menos testa manualmente)
- Documenta as mudanças importantes
- Usa commits que fazem sentido (nada de "fix" ou "update"... seja mais específico!)

## 📊 O que vem por aí

Tenho algumas ideias na manga (se der tempo e disposição 😄):

- [ ] **v1.1** - Notificações push (pra te lembrar das coisas)
- [ ] **v1.2** - Integração com Google Calendar (finalmente!)
- [ ] **v1.3** - Modo offline (pra quando a internet falha)
- [ ] **v1.4** - API REST completa (pra quem quiser integrar)
- [ ] **v1.5** - App mobile nativo (React Native, provavelmente)
- [ ] **v2.0** - IA pra dar recomendações (porque tudo hoje tem IA, né?)

## 🐛 Achou um bug?

Se alguma coisa não tá funcionando, me conta! Abre uma [issue](https://github.com/seu-usuario/learnhub/issues) e coloca:

- O que tava tentando fazer
- O que aconteceu (e o que deveria ter acontecido)
- Print da tela (se ajudar)
- Que navegador/sistema você tá usando

Vou tentar resolver o mais rápido possível!

## 📝 Licença

Esse projeto é **MIT**, ou seja, você pode fazer praticamente qualquer coisa com ele. Só não me processa se algo der errado! 😅

Vê o arquivo [LICENSE](LICENSE) se quiser os detalhes legais.

## 👥 Quem fez isso

- **Eu mesmo** - [Meu GitHub](https://github.com/seu-usuario) (ainda aprendendo, mas tentando!)

## 📞 Fala comigo

Se quiser trocar uma ideia:

- **Email**: seuemail@exemplo.com
- **LinkedIn**: [Meu LinkedIn](https://linkedin.com/in/seu-perfil)
- **GitHub**: [Meu GitHub](https://github.com/seu-usuario)

## 🙏 Valeu galera!

Uns créditos pra quem tornou isso possível:

- [Create React App](https://create-react-app.dev/) - Salvou minha vida com a configuração inicial
- [Firebase](https://firebase.google.com/) - Google fazendo o trabalho pesado
- [React Icons](https://react-icons.github.io/react-icons/) - Ícones lindos de graça
- [Framer Motion](https://www.framer.com/motion/) - Animações que fazem tudo parecer profissional
- E todo mundo que contribuiu com dicas, sugestões e paciência!

---

<div align="center">
  Feito com ❤️ (e muito café ☕) para estudantes que querem se organizar sem surtar
</div>
