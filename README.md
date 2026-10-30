# Studanti

Uma aplicação de aprendizagem em português com cursos, apontamentos, questionários e acompanhamento do progresso.

## Executar localmente

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abre o endereço mostrado pelo Vite no navegador. Para validar a versão de produção:

```sh
npm run lint
npm run build
npm run preview
```

## Instalar como aplicação

O Studanti é uma Progressive Web App (PWA). Depois de publicar a pasta `dist` num alojamento com HTTPS, abre o site num navegador compatível e escolhe **Instalar aplicação**. Em desenvolvimento local, o navegador também permite testar a instalação em `localhost`. A aplicação guarda em cache os ficheiros necessários para voltar a abrir offline.

## Escrever os conteúdos

Os cursos vivem em `src/cursos/`, com uma pasta por curso. Enquanto `npm run dev` está a correr, cada ficheiro guardado aparece logo no navegador.

```text
src/cursos/
  html-css/
    curso.md             dados do curso
    01-estrutura-html.md uma aula
    02-textos-links.md   outra aula
    questionario.md      questionário (opcional)
```

### Aulas

Cada ficheiro `.md` é uma aula. O número no início do nome define a ordem. O cabeçalho entre `---` tem o título e a duração em minutos; o resto é o texto em Markdown:

````markdown
---
titulo: Introdução ao CSS
duracao: 15
---

O CSS define o **aspeto** de uma página.

## Seletores

- Um seletor escolhe os elementos.
- Uma regra diz como ficam.

```css
p { color: purple; }
```

> **Dica:** experimenta alterar a cor.
````

Para criar uma aula, cria um ficheiro novo; para a remover, apaga-o. O número e a duração do curso são calculados a partir dos ficheiros.

Podes usar títulos (`##`, `###`), **negrito**, listas, ligações, tabelas, citações e blocos de código. O código HTML escrito fora de `` `crases` `` aparece como texto, sem ser interpretado, por isso escreve exemplos de código sempre entre crases. Para imagens, coloca o ficheiro em `public/imagens/` e usa `![Descrição](/imagens/foto.png)`. Ao substituir uma imagem publicada, usa um nome de ficheiro novo: quem já a abriu mantém a versão antiga em cache.

Mudar só o número de uma aula mantém o progresso dos alunos; mudar o resto do nome faz com que seja considerada uma aula nova.

### Dados do curso

`curso.md` tem apenas o cabeçalho. A pasta do curso é o seu identificador: não a renomeies depois de publicar, ou o progresso dos alunos nesse curso perde-se.

```markdown
---
titulo: HTML & CSS
categoria: Programação
nivel: Iniciante
cor: coral
icone: </>
ordem: 1
descricao: Cria páginas web bonitas e responsivas.
---
```

As cores disponíveis são `coral`, `yellow`, `purple`, `blue` e `pink`. As categorias novas aparecem sozinhas no menu e nos filtros. Escreve os valores sem aspas.

### Questionários

Em `questionario.md`, cada `##` é uma pergunta e a resposta certa fica marcada com `[x]`:

```markdown
---
titulo: Fundamentos de HTML
---

## Que etiqueta é usada para criar um parágrafo?

- [x] <p>
- [ ] <div>
- [ ] <span>
```

Cada pergunta precisa de duas ou mais opções e exatamente uma `[x]`. As que não cumprirem isto não aparecem, e o motivo fica na consola do navegador (F12).

### Publicar

Corre `npm run build` e publica a pasta `dist`. Os conteúdos ficam incluídos na aplicação, por isso cada alteração só chega aos alunos depois de uma nova publicação.

## O que já está incluído

- Cursos de HTML & CSS, JavaScript e PHP & MySQL, com aulas escritas em ficheiros Markdown.
- Apontamentos e questionários interativos.
- Progresso de aulas e resultados guardados no dispositivo com `localStorage`.
- Pesquisa e filtros de cursos, navegação adaptada a telemóveis e instalação PWA.

Esta versão é um protótipo local: não tem servidor, contas de utilizador, sincronização entre dispositivos nem ferramentas de administração para publicar cursos. Essas funcionalidades precisam de um backend e de uma base de dados antes de ser usada como plataforma escolar multiutilizador.
