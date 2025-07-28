# 🤝 Guia de Contribuição - LearnHub

Obrigado por considerar contribuir com o LearnHub! Este documento contém diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em seguir nosso código de conduta. Seja respeitoso e construtivo em todas as interações.

## 🚀 Como Contribuir

### Reportando Bugs

1. **Verifique** se o bug já foi reportado nas [issues existentes](https://github.com/seu-usuario/learnhub/issues)
2. **Crie uma nova issue** com o template de bug report
3. **Inclua informações detalhadas**:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, navegador, versão)

### Sugerindo Melhorias

1. **Verifique** se a sugestão já existe nas issues
2. **Crie uma nova issue** com o template de feature request
3. **Descreva claramente**:
   - Problema que a feature resolve
   - Solução proposta
   - Alternativas consideradas
   - Impacto esperado

### Contribuindo com Código

1. **Fork** o repositório
2. **Clone** sua fork localmente
```bash
git clone https://github.com/seu-usuario/learnhub.git
cd learnhub
```

3. **Crie uma branch** para sua feature
```bash
git checkout -b feature/nome-da-feature
```

4. **Configure o ambiente**
```bash
npm install
npm start
```

5. **Faça suas alterações**
   - Siga os padrões de código existentes
   - Escreva testes para novas funcionalidades
   - Mantenha commits pequenos e focados

6. **Teste suas alterações**
```bash
npm test
npm run build
```

7. **Commit com mensagem descritiva**
```bash
git commit -m "feat: adiciona funcionalidade X"
```

8. **Push para sua branch**
```bash
git push origin feature/nome-da-feature
```

9. **Abra um Pull Request**

## 📝 Padrões de Código

### JavaScript/React
- Use **ES6+** features
- Prefira **function components** com hooks
- Use **PropTypes** para validação de props
- Mantenha componentes **pequenos e focados**
- Use **nomes descritivos** para variáveis e funções

### CSS
- Use **CSS Modules** ou **styled-components**
- Siga a metodologia **BEM** para classes CSS
- Mantenha estilos **organizados** por componente
- Use variáveis CSS para **cores** e **espaçamentos**

### Estrutura de Arquivos
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks customizados
├── context/            # Contextos React
├── services/           # Serviços e APIs
├── utils/              # Funções utilitárias
├── styles/             # Estilos globais
└── __tests__/          # Testes
```

## 🧪 Testes

- **Escreva testes** para novas funcionalidades
- **Mantenha coverage** acima de 80%
- Use **Testing Library** para testes de componentes
- Teste **casos de erro** e **edge cases**

### Executando Testes
```bash
# Todos os testes
npm test

# Testes em modo watch
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## 📦 Commits

Use **Conventional Commits** para padronizar mensagens:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação de código
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Tarefas de manutenção

### Exemplos
```bash
feat(dashboard): adiciona widget de estatísticas
fix(auth): corrige erro de login com email
docs(readme): atualiza instruções de instalação
style(components): formata código dos componentes
refactor(utils): simplifica função de validação
test(auth): adiciona testes para AuthContext
chore(deps): atualiza dependências do projeto
```

## 🔄 Process de Review

1. **Automated checks** devem passar
2. **Code review** por pelo menos um maintainer
3. **Testes** devem estar passando
4. **Documentation** deve estar atualizada
5. **Conflicts** devem ser resolvidos

## 📚 Recursos Úteis

- [React Documentation](https://reactjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Testing Library Docs](https://testing-library.com/docs)
- [Conventional Commits](https://conventionalcommits.org)

## 🎯 Prioridades Atuais

### High Priority
- [ ] Sistema de notificações
- [ ] Melhorias de performance
- [ ] Testes unitários
- [ ] Documentação de APIs

### Medium Priority
- [ ] PWA features
- [ ] Integração com Google Calendar
- [ ] Export/Import de dados
- [ ] Modo offline

### Low Priority
- [ ] Temas customizados
- [ ] Plugins de terceiros
- [ ] Internacionalização
- [ ] Analytics avançados

## 🏷️ Labels das Issues

- **bug**: Algo não está funcionando
- **enhancement**: Nova funcionalidade ou melhoria
- **documentation**: Melhorias na documentação
- **good first issue**: Bom para iniciantes
- **help wanted**: Ajuda extra é bem-vinda
- **question**: Mais informações são necessárias
- **wontfix**: Não será corrigido/implementado

## 💬 Comunicação

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas e ideias
- **Email**: seuemail@exemplo.com para questões sensíveis

## 🙏 Agradecimentos

Obrigado por contribuir com o LearnHub! Sua ajuda é fundamental para tornar esta plataforma ainda melhor para todos os estudantes.

---

*Este documento está em constante evolução. Sugestões de melhoria são sempre bem-vindas!*
