# 🤝 Quer ajudar? Que massa!

E aí! Obrigado por querer contribuir com o LearnHub! 🎉 Não precisa ser expert, toda ajuda é bem-vinda - desde reportar um bug até sugerir uma feature nova.

## 📋 Só uma coisinha antes...

Vamos manter o ambiente legal pra todo mundo, ok? Seja gentil, respeitoso e construtivo. A gente tá aqui pra aprender e ajudar uns aos outros!

## 🚀 Como você pode ajudar

### Achou um bug? 🐛

Acontece com todo mundo! Se algo não tá funcionando:

1. **Dá uma olhada** nas [issues existentes](https://github.com/seu-usuario/learnhub/issues) pra ver se alguém já reportou
2. **Se não achou nada**, cria uma issue nova
3. **Conta pra gente**:
   - O que você tava tentando fazer
   - O que aconteceu (e o que deveria ter acontecido)
   - Como reproduzir o problema
   - Print da tela (sempre ajuda!)
   - Que sistema/navegador você tá usando

### Tem uma ideia legal? 💡

Sempre tem espaço pra melhorar! Se você tem uma sugestão:

1. **Vê se alguém já sugeriu** nas issues
2. **Se não**, cria uma issue nova
3. **Explica sua ideia**:
   - Que problema isso resolveria
   - Como você imagina que funcionaria
   - Por que seria útil
   - Se pensou em outras formas de fazer

### Quer meter a mão no código? 👨‍💻👩‍💻

Agora a coisa fica séria! Mas relaxa, é mais simples do que parece:

1. **Faz um fork** do repositório (botão ali no GitHub)
2. **Clona** pro seu computador
```bash
git clone https://github.com/seu-usuario/learnhub.git
cd learnhub
```

3. **Cria uma branch** nova (não mexe na main!)
```bash
git checkout -b minha-feature-incrivel
```

4. **Instala as dependências**
```bash
npm install
npm start
```
(Aproveita pra pegar um café enquanto instala ☕)

5. **Faz suas mudanças**
   - Tenta seguir o estilo do código que já tá lá
   - Se criar algo novo, escreve uns testes
   - Commits pequenos são melhores que um commit gigante

6. **Testa se não quebrou nada**
```bash
npm test
npm run build
```

7. **Commita com uma mensagem que faça sentido**
```bash
git commit -m "feat: adiciona funcionalidade X que faz Y"
```

8. **Manda pro seu fork**
```bash
git push origin minha-feature-incrivel
```

9. **Abre um Pull Request** e explica o que você fez!

## 📝 Padrões de Código (ou: como não deixar o código uma bagunça)

### JavaScript/React
- **ES6+** é vida (arrow functions, destructuring, essas coisas)
- **Function components** com hooks (deixa class component pra 2018)
- **PropTypes** pra validar props (ou TypeScript se você for corajoso)
- **Componentes pequenos** - se tá muito grande, quebra em pedaços menores
- **Nomes que fazem sentido** - `getUserData()` é melhor que `getData()`

### CSS
- **CSS Modules** ou **styled-components** (o que você preferir)
- **BEM** pra classes CSS (se souber usar, senão faz do seu jeito)
- **Organiza por componente** - cada componente com seu CSS
- **Variáveis CSS** pra cores e espaçamentos (facilita pra mudar depois)

### Como organizar os arquivos
```
src/
├── components/          # Componentes que você usa em vários lugares
├── pages/              # As páginas da aplicação
├── hooks/              # Hooks customizados (se fizer algum)
├── context/            # Contextos React (estado global)
├── services/           # Integrações com APIs
├── utils/              # Funções úteis
├── styles/             # CSS global
└── __tests__/          # Testes (se você escrever)
```

## 🧪 Testes (a parte que ninguém gosta mas é importante)

### Escrevendo Testes
- **Testa as coisas importantes** (não precisa testar tudo)
- **Jest** e **React Testing Library** são nossos amigos
- **Escreve testes que fazem sentido** - se você não entender daqui 6 meses, tá errado
- **Testa o que o usuário vê**, não como o código funciona por dentro

### Cobertura de Testes
- **80% de cobertura** é o ideal (mas não fica neurótico com isso)
- **Foca no que importa** - melhor ter poucos testes bons que muitos ruins
- **Testa quando as coisas dão errado** também

### Ferramentas que usamos
- **Jest**: Pra rodar os testes
- **React Testing Library**: Pra testar componentes
- **MSW**: Pra simular APIs (quando precisar)

### Como rodar os testes
```bash
npm test              # Roda todos os testes
npm test -- --watch   # Fica rodando e testa quando você salva
npm test -- --coverage # Mostra quanto % do código tá testado
```

## 📋 Como escrever commits que fazem sentido

Usamos **Conventional Commits** pra manter as coisas organizadas (e pra gerar changelog automático).

### Tipos de Commit
- `feat`: Funcionalidade nova
- `fix`: Consertou um bug
- `docs`: Mexeu na documentação
- `style`: Formatação, espaços, vírgulas
- `refactor`: Reorganizou o código (mas não mudou funcionalidade)
- `test`: Adicionou ou consertou testes
- `chore`: Coisas de manutenção (dependências, config, etc)

### Exemplos de commits bons
```bash
feat: adiciona sistema de notificações push
fix: corrige erro no cálculo de gastos mensais
docs: atualiza README com instruções de deploy
style: formata código do componente Header
refactor: reorganiza estrutura de pastas do projeto
test: adiciona testes para AuthContext
chore: atualiza React para versão 18
```

## 🔍 Como funciona o review (não se preocupa, é tranquilo)

1. **Os checks automáticos** precisam passar (CI/CD faz isso pra gente)
2. **Alguém da equipe** vai dar uma olhada no seu código
3. **Testes** têm que estar funcionando
4. **Documentação** atualizada (se mudou algo importante)
5. **Conflitos** resolvidos (o GitHub avisa se tiver)

## 📚 Links úteis (pra quando você travar)

- [Documentação do React](https://reactjs.org/docs) - A bíblia do React
- [Firebase Docs](https://firebase.google.com/docs) - Tudo sobre Firebase
- [Testing Library](https://testing-library.com/docs) - Como testar direito
- [Conventional Commits](https://conventionalcommits.org) - Como escrever commits

## 🎯 No que tamos focando agora

### Prioridade Alta (precisa fazer logo)
- [ ] Sistema de notificações push
- [ ] Melhorar a performance (tá meio lento)
- [ ] Escrever mais testes
- [ ] Documentar as APIs

### Prioridade Média (seria legal ter)
- [ ] Funcionalidades de PWA
- [ ] Integração com Google Calendar
- [ ] Exportar/Importar dados
- [ ] Funcionar offline

### Prioridade Baixa (um dia a gente faz)
- [ ] Temas personalizados
- [ ] Sistema de plugins
- [ ] Tradução pra outras línguas
- [ ] Analytics mais detalhados

## 🏷️ Etiquetas das Issues (pra organizar a bagunça)

- **bug**: Algo quebrou e precisa consertar 🐛
- **enhancement**: Ideia nova ou melhoria 💡
- **documentation**: Precisa melhorar a documentação 📝
- **good first issue**: Perfeito pra quem tá começando 🌱
- **help wanted**: Precisamos de uma força aqui 🆘
- **question**: Dúvida ou precisa de mais info ❓
- **wontfix**: Não vamos fazer isso (pelo menos por enquanto) 🚫

## 💬 Como falar com a gente

- **Issues**: Pra reportar bugs ou sugerir funcionalidades
- **Discussions**: Pra bater papo, tirar dúvidas ou trocar ideias
- **Email**: seuemail@exemplo.com pra coisas mais sérias ou privadas

## 🙏 Valeu mesmo!

Sério, muito obrigado por querer contribuir com o LearnHub! 🎉

Cada linha de código, cada bug reportado, cada sugestão... tudo isso faz a diferença pra tornar essa plataforma melhor pra galera que estuda.

Você é incrível! 🚀

---

*PS: Este documento tá sempre mudando. Se você tem alguma sugestão pra melhorar, manda ver!*
