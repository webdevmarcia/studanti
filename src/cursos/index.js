const files = import.meta.glob('./*/*.md', { query: '?raw', import: 'default', eager: true })

const colors = ['coral', 'yellow', 'purple', 'blue', 'pink']

function parseFile(raw) {
  const text = raw.trimStart().replace(/\r\n/g, '\n')
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/)
  if (!match) return { fields: {}, body: text.trim() }

  const fields = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator > 0) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }
  return { fields, body: match[2].trim() }
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`
}

function parseLesson(fileName, raw) {
  const { fields, body } = parseFile(raw)
  // O número do ficheiro só define a ordem: renumerar aulas não apaga o progresso.
  const id = fileName.replace(/\.md$/, '').replace(/^\d+-/, '')
  return { id, title: fields.titulo || id, minutes: Number(fields.duracao) || 0, body }
}

function parseQuiz(course, raw) {
  const { fields, body } = parseFile(raw)
  const questions = []

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.+)/)
    const option = line.match(/^\s*[-*]\s+(?:\[([xX ])\]\s+)?(.+)/)
    if (heading) {
      questions.push({ question: heading[1].trim(), options: [], answer: -1, marked: 0 })
    } else if (option && questions.length > 0) {
      const question = questions[questions.length - 1]
      question.options.push(option[2].trim())
      if (option[1]?.toLowerCase() === 'x') {
        question.answer = question.options.length - 1
        question.marked += 1
      }
    }
  }

  const validQuestions = questions.filter((question) => {
    const isValid = question.marked === 1 && question.options.length >= 2
    if (!isValid) console.warn(`${course.id}/questionario.md: pergunta ignorada, precisa de 2 ou mais opções e exatamente uma [x]: “${question.question}”`)
    return isValid
  })

  if (validQuestions.length === 0) return null
  return {
    id: `${course.id}-quiz`,
    courseId: course.id,
    subject: course.title,
    title: fields.titulo || `Questionário de ${course.title}`,
    questions: validQuestions.map(({ question, options, answer }) => ({ question, options, answer })),
  }
}

const folders = {}
for (const [path, raw] of Object.entries(files)) {
  const [, folder, fileName] = path.split('/')
  folders[folder] ??= {}
  folders[folder][fileName] = raw
}

export const courses = Object.entries(folders)
  .filter(([, folderFiles]) => folderFiles['curso.md'])
  .map(([id, folderFiles]) => {
    const { fields } = parseFile(folderFiles['curso.md'])
    const lessons = Object.keys(folderFiles)
      .filter((fileName) => fileName !== 'curso.md' && fileName !== 'questionario.md')
      .sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }))
      .map((fileName) => parseLesson(fileName, folderFiles[fileName]))
    return {
      id,
      title: fields.titulo || id,
      category: fields.categoria || 'Outros',
      level: fields.nivel || 'Iniciante',
      color: colors.includes(fields.cor) ? fields.cor : 'purple',
      icon: fields.icone || '✦',
      description: fields.descricao || '',
      order: Number(fields.ordem) || Infinity,
      lessons,
      duration: formatDuration(lessons.reduce((total, lesson) => total + lesson.minutes, 0)),
    }
  })
  .sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title, 'pt'))

export const quizzes = courses
  .map((course) => (folders[course.id]['questionario.md'] ? parseQuiz(course, folders[course.id]['questionario.md']) : null))
  .filter(Boolean)
