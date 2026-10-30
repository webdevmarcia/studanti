import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { courses, formatDuration, quizzes } from './cursos'
import './App.css'

const categories = [...new Set(courses.map((course) => course.category))]

const sampleNotes = [
  { id: 'sample-html', courseId: 'html-css', title: 'As etiquetas HTML essenciais', detail: 'Uma página começa com <!doctype html>, seguida das etiquetas html, head e body. Usa h1 para o título principal e p para parágrafos.', updatedAt: null },
  { id: 'sample-js', courseId: 'javascript', title: 'Variáveis: let e const', detail: 'Usa const quando o valor não precisa de ser reatribuído e let quando pode mudar. Evita var nos projetos novos.', updatedAt: null },
  { id: 'sample-php', courseId: 'php-mysql', title: 'O que é uma base de dados?', detail: 'Uma base de dados organiza informação em tabelas. No MySQL, podes consultar os registos com SELECT e adicionar novos com INSERT.', updatedAt: null },
]

const navigation = [
  { id: 'overview', label: 'Visão geral', icon: 'grid' },
  { id: 'courses', label: 'Os meus cursos', icon: 'book' },
  { id: 'notes', label: 'Apontamentos', icon: 'note' },
  { id: 'quizzes', label: 'Questionários', icon: 'quiz' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    quiz: <><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="10" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
  }

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function readProgress() {
  try {
    const storedProgress = JSON.parse(localStorage.getItem('studanti-progress') || '{}')
    // O progresso antigo guardava só o número de aulas concluídas.
    return Object.fromEntries(Object.entries(storedProgress).map(([courseId, item]) => {
      if (Array.isArray(item.completed)) return [courseId, item]
      const lessons = courses.find((course) => course.id === courseId)?.lessons || []
      return [courseId, { ...item, completed: lessons.slice(0, item.completed || 0).map((lesson) => lesson.id) }]
    }))
  } catch {
    return {}
  }
}

function countCompleted(course, courseProgress) {
  return course.lessons.filter((lesson) => courseProgress?.completed?.includes(lesson.id)).length
}

function percentOf(completed, total) {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

function readStudyLog() {
  try {
    const storedLog = JSON.parse(localStorage.getItem('studanti-study-log') || '[]')
    return Array.isArray(storedLog) ? storedLog : []
  } catch {
    return []
  }
}

function readNotes() {
  try {
    const storedNotes = JSON.parse(localStorage.getItem('studanti-notes'))
    return Array.isArray(storedNotes) ? storedNotes : sampleNotes
  } catch {
    return sampleNotes
  }
}

function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [progress, setProgress] = useState(readProgress)
  const [studyLog, setStudyLog] = useState(readStudyLog)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installHelp, setInstallHelp] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notes, setNotes] = useState(readNotes)
  const [notesFilter, setNotesFilter] = useState('all')
  const [noteEditor, setNoteEditor] = useState(null)

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  })

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null
  const selectedLesson = selectedCourse?.lessons.find((lesson) => lesson.id === selectedLessonId) || null
  const selectedQuiz = quizzes.find((quiz) => quiz.courseId === selectedCourseId)

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesCategory = category === 'Todos' || course.category === category
    const matchesSearch = `${course.title} ${course.description}`.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }), [category, search])

  const completedLessons = courses.reduce((total, course) => total + countCompleted(course, progress[course.id]), 0)
  const totalLessons = courses.reduce((total, course) => total + course.lessons.length, 0)
  const overallProgress = percentOf(completedLessons, totalLessons)
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - mondayOffset + index)
    return date
  })
  const weeklyActivity = weekDays.map((date) => studyLog.filter((day) => day === localDateKey(date)).length)
  const todayKey = localDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  let streakDate = studyLog.includes(todayKey) ? today : yesterday
  let streak = 0
  const studyDays = new Set(studyLog)
  while (studyDays.has(localDateKey(streakDate))) {
    streak += 1
    streakDate = new Date(streakDate)
    streakDate.setDate(streakDate.getDate() - 1)
  }

  function saveProgress(nextProgress) {
    setProgress(nextProgress)
    localStorage.setItem('studanti-progress', JSON.stringify(nextProgress))
  }

  function openCourse(course) {
    setSelectedCourseId(course.id)
    setSelectedLessonId(null)
    window.scrollTo(0, 0)
  }

  function closeCourse() {
    setSelectedCourseId(null)
    setSelectedLessonId(null)
  }

  function openLesson(lesson) {
    setSelectedLessonId(lesson.id)
    window.scrollTo(0, 0)
  }

  function completeLesson(courseId, lessonId) {
    const current = progress[courseId] || { completed: [], score: null }
    if (current.completed.includes(lessonId)) return
    const nextProgress = {
      ...progress,
      [courseId]: { ...current, completed: [...current.completed, lessonId] },
    }
    saveProgress(nextProgress)
    const nextStudyLog = [...studyLog, todayKey]
    setStudyLog(nextStudyLog)
    localStorage.setItem('studanti-study-log', JSON.stringify(nextStudyLog))
  }

  function openQuiz(quiz) {
    setActiveQuiz(quiz)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  function submitQuiz() {
    if (Object.keys(quizAnswers).length !== activeQuiz.questions.length) return
    const score = activeQuiz.questions.reduce((total, question, index) => total + (quizAnswers[index] === question.answer ? 1 : 0), 0)
    const current = progress[activeQuiz.courseId] || { completed: [], score: null }
    saveProgress({ ...progress, [activeQuiz.courseId]: { ...current, score } })
    setQuizSubmitted(true)
  }

  function saveNotes(nextNotes) {
    setNotes(nextNotes)
    try {
      localStorage.setItem('studanti-notes', JSON.stringify(nextNotes))
    } catch {
      // O armazenamento pode estar bloqueado; as notas ficam disponíveis até fechar a página.
    }
  }

  function saveNote(draft) {
    const note = { ...draft, title: draft.title.trim(), detail: draft.detail.trim(), updatedAt: new Date().toISOString() }
    if (draft.id) saveNotes(notes.map((item) => (item.id === draft.id ? note : item)))
    else saveNotes([{ ...note, id: `note-${Date.now()}` }, ...notes])
    setNoteEditor(null)
  }

  function deleteNote(note) {
    if (!window.confirm(`Apagar o apontamento “${note.title}”?`)) return
    saveNotes(notes.filter((item) => item.id !== note.id))
    if (noteEditor?.id === note.id) setNoteEditor(null)
  }

  function writeCourseNote(courseId) {
    setNotesFilter(courseId)
    setNoteEditor({ courseId, title: '', detail: '' })
    closeCourse()
    setActiveSection('notes')
  }

  async function installApp() {
    if (!installPrompt) {
      setInstallHelp(true)
      return
    }
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const sectionTitles = {
    overview: ['Bom dia, Márcia', 'Continua a aprender ao teu ritmo. Cada passo conta!'],
    courses: ['Os meus cursos', 'Escolhe um curso e continua de onde ficaste.'],
    notes: ['Apontamentos', 'Escreve as tuas notas de cada curso para rever sempre que quiseres.'],
    quizzes: ['Questionários', 'Põe os teus conhecimentos à prova, sem pressão.'],
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#inicio" onClick={() => { setActiveSection('overview'); setMenuOpen(false) }}>
          <span className="brand-mark">s<span>.</span></span>
          <span>studanti<small>APRENDER, TODOS OS DIAS</small></span>
        </a>
        <div className="sidebar-label">MENU</div>
        <nav className="side-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <button key={item.id} className={`nav-item ${activeSection === item.id ? 'nav-active' : ''}`} onClick={() => { setActiveSection(item.id); closeCourse(); setMenuOpen(false) }}>
              <Icon name={item.icon} size={19} />{item.label}
              {item.id === 'quizzes' && <span className="nav-count">{quizzes.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-label category-label">CATEGORIAS</div>
        {categories.map((item) => <button key={item} className={`category-link ${category === item ? 'category-selected' : ''}`} onClick={() => { setCategory(item); setActiveSection('courses'); closeCourse(); setMenuOpen(false) }}><i className="category-dot dot-coral" />{item}</button>)}
        <div className="sidebar-bottom">
          <div className="install-card">
            <div className="install-icon"><Icon name="download" size={18} /></div>
            <strong>Leva o Studanti contigo</strong>
            <p>Instala a aplicação no teu dispositivo.</p>
            <button onClick={installApp}>Instalar aplicação <Icon name="arrow" size={15} /></button>
          </div>
          <button className="profile-button" aria-label="Perfil de Márcia Costa">
            <span className="avatar">MC</span><span className="profile-copy"><strong>Márcia Costa</strong><small>A minha conta</small></span><span className="profile-dots">···</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
          <span className="breadcrumb">A tua escola <span>/</span> <strong>{selectedCourse ? selectedCourse.title : navigation.find((item) => item.id === activeSection)?.label || 'Visão geral'}</strong></span>
          <div className="topbar-right">
            <button className="top-search" onClick={() => document.querySelector('#course-search')?.focus()} aria-label="Pesquisar cursos"><Icon name="search" size={18} /><span>Pesquisar</span><kbd>⌘ K</kbd></button>
            <span className="top-avatar">MC</span>
          </div>
        </header>

        <div className="page-content">
          {selectedLesson ? (
            <LessonView course={selectedCourse} lesson={selectedLesson} progress={progress[selectedCourse.id]} onBack={() => openCourse(selectedCourse)} onOpenLesson={openLesson} onComplete={() => completeLesson(selectedCourse.id, selectedLesson.id)} />
          ) : selectedCourse ? (
            <CourseDetail course={selectedCourse} progress={progress[selectedCourse.id]} noteCount={notes.filter((note) => note.courseId === selectedCourse.id).length} onWriteNote={() => writeCourseNote(selectedCourse.id)} onBack={closeCourse} onOpenLesson={openLesson} onQuiz={selectedQuiz ? () => openQuiz(selectedQuiz) : null} />
          ) : activeSection === 'overview' ? (
            <Overview
              progress={progress}
              completedLessons={completedLessons}
              overallProgress={overallProgress}
              weeklyActivity={weeklyActivity}
              weeklyTotal={weeklyActivity.reduce((total, count) => total + count, 0)}
              streak={streak}
              onCourseClick={openCourse}
              onSectionChange={setActiveSection}
              onQuizClick={openQuiz}
              onInstall={installApp}
            />
          ) : activeSection === 'courses' ? (
            <section>
              <PageHeading title={sectionTitles.courses[0]} description={sectionTitles.courses[1]} />
              <CourseLibrary courses={filteredCourses} search={search} setSearch={setSearch} category={category} setCategory={setCategory} progress={progress} onCourseClick={openCourse} />
            </section>
          ) : activeSection === 'notes' ? (
            <section>
              <PageHeading title={sectionTitles.notes[0]} description={sectionTitles.notes[1]} />
              <NotesBoard notes={notes} filter={notesFilter} setFilter={setNotesFilter} editor={noteEditor} setEditor={setNoteEditor} onSave={saveNote} onDelete={deleteNote} onCourseClick={openCourse} />
              <div className="notes-tip"><span>✦</span><p><strong>Dica de aprendizagem</strong> Rever as tuas notas alguns minutos por dia ajuda a fixar o que aprendeste.</p></div>
            </section>
          ) : (
            <section>
              <PageHeading title={sectionTitles.quizzes[0]} description={sectionTitles.quizzes[1]} />
              <div className="quiz-grid">{quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} score={progress[quiz.courseId]?.score} onClick={() => openQuiz(quiz)} />)}</div>
            </section>
          )}
        </div>
      </main>

      {activeQuiz && <QuizDialog quiz={activeQuiz} answers={quizAnswers} setAnswers={setQuizAnswers} submitted={quizSubmitted} onSubmit={submitQuiz} onClose={() => setActiveQuiz(null)} />}
      {installHelp && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInstallHelp(false) }}><section className="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title"><button className="modal-close" aria-label="Fechar" onClick={() => setInstallHelp(false)}><Icon name="close" /></button><div className="install-dialog-icon"><Icon name="download" size={23} /></div><h2 id="install-title">Instala o Studanti</h2><p>No menu do teu navegador, escolhe <strong>“Adicionar ao ecrã principal”</strong> ou <strong>“Instalar aplicação”</strong> para teres acesso rápido ao Studanti.</p><button className="primary-button" onClick={() => setInstallHelp(false)}>Percebi</button></section></div>}
    </div>
  )
}

function PageHeading({ title, description }) {
  return <div className="page-heading"><div><div className="eyebrow">A TUA JORNADA DE APRENDIZAGEM</div><h1>{title}</h1><p>{description}</p></div></div>
}

function Overview({ progress, completedLessons, overallProgress, weeklyActivity, weeklyTotal, streak, onCourseClick, onSectionChange, onQuizClick, onInstall }) {
  const continueCourse = courses.find((course) => countCompleted(course, progress[course.id]) > 0) || courses[0]
  return (
    <>
      <section className="welcome-row">
        <div><div className="eyebrow">{new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} <span className="eyebrow-spark">✳</span></div><h1>Bom dia, Márcia <span className="wave">✦</span></h1><p>Continua a aprender ao teu ritmo. Cada passo conta!</p></div>
        <div className="streak-pill"><span>✦</span> {streak} {streak === 1 ? 'dia' : 'dias'} seguidos</div>
      </section>
      <section className="hero-card">
        <div className="hero-copy"><span className="hero-kicker">O TEU PRÓXIMO PASSO</span><h2>Um bocadinho<br />todos os dias.</h2><p>Estás a construir algo incrível. Continua — o teu próximo objetivo está mesmo à tua frente.</p><button onClick={() => onCourseClick(continueCourse)}>Continuar a aprender <Icon name="arrow" size={17} /></button></div>
        <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-sun">✳</div><div className="hero-book"><span /><span /><span /></div><div className="hero-star star-one">✦</div><div className="hero-star star-two">✳</div><div className="hero-sticker">o teu<br />futuro<br /><strong>começa<br />aqui</strong></div></div>
        <div className="hero-caption">PEQUENOS PASSOS, GRANDES CONQUISTAS</div>
      </section>
      <section className="stats-row" aria-label="O teu progresso">
        <StatCard label="Cursos disponíveis" value={String(courses.length).padStart(2, '0')} icon="book" tone="stat-lilac" detail="Aprende algo novo" />
        <StatCard label="Aulas concluídas" value={String(completedLessons).padStart(2, '0')} icon="check" tone="stat-mint" detail="Continua assim!" />
        <StatCard label="Progresso geral" value={`${overallProgress}%`} icon="spark" tone="stat-peach" detail="Estás no bom caminho" progress={overallProgress} />
      </section>
      <section className="section-block">
        <div className="section-title-row"><div><span className="eyebrow">FEITO PARA TI</span><h2>Continua a aprender</h2></div><button className="text-link" onClick={() => onSectionChange('courses')}>Ver todos os cursos <Icon name="arrow" size={16} /></button></div>
        <div className="course-grid">{courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} progress={progress[course.id]} onClick={() => onCourseClick(course)} />)}</div>
      </section>
      <section className="bottom-grid">
        <div className="activity-card"><div className="section-title-row compact"><div><span className="eyebrow">UM POUCO DE CADA VEZ</span><h2>A tua atividade</h2></div><span className="activity-period">Esta semana</span></div><div className="activity-chart"><div className="chart-labels"><span>Mais</span><span /><span>Menos</span></div><div className="chart-plot"><div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-bars">{weeklyActivity.map((count, index) => <div className="bar-column" key={index}><span className={`activity-bar ${count > 0 ? 'bar-highlight' : ''}`} style={{ height: `${count ? Math.max(12, (count / Math.max(...weeklyActivity, 1)) * 100) : 3}%` }} /><small>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index]}</small></div>)}</div></div></div><div className="activity-footer"><span><i /> Aulas concluídas</span><strong>{weeklyTotal} <span>esta semana</span></strong></div></div>
        <div className="quiz-promo"><div className="quiz-promo-icon"><Icon name="spark" size={21} /></div><span className="eyebrow">DESAFIO RÁPIDO</span><h2>Sabes mesmo<br />o que aprendeste?</h2><p>Um questionário rápido ajuda-te a fixar as ideias.</p><button onClick={() => onQuizClick(quizzes[0])}>Fazer um questionário <Icon name="arrow" size={16} /></button><div className="quiz-promo-decoration" aria-hidden="true">?</div></div>
      </section>
      <button className="mobile-install" onClick={onInstall}><Icon name="download" size={17} /> Instalar Studanti</button>
    </>
  )
}

function StatCard({ label, value, icon, tone, detail, progress }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={18} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong>{progress !== undefined ? <div className="stat-progress"><span style={{ width: `${progress}%` }} /></div> : null}<span className="stat-detail">{detail}</span></article>
}

function CourseCard({ course, progress, onClick }) {
  const completed = countCompleted(course, progress)
  const percent = percentOf(completed, course.lessons.length)
  return <article className="course-card" onClick={onClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onClick() }} role="button" tabIndex={0}><div className={`course-art art-${course.color}`}><span className="course-art-icon">{course.icon}</span><span className="course-art-shape shape-one" /><span className="course-art-shape shape-two" /><span className="course-art-label">{course.category}</span></div><div className="course-card-body"><div className="course-meta"><span>{course.level}</span><span><Icon name="clock" size={14} />{course.duration}</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-progress-copy"><span>{completed > 0 ? `${completed} de ${course.lessons.length} aulas` : `${course.lessons.length} aulas`}</span><span>{percent}%</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><button className="course-open" tabIndex={-1}>Abrir curso <Icon name="arrow" size={15} /></button></div></article>
}

function CourseLibrary({ courses: visibleCourses, search, setSearch, category, setCategory, progress, onCourseClick }) {
  return <><div className="library-toolbar"><label className="library-search"><Icon name="search" size={18} /><input id="course-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar cursos..." /></label><div className="filter-pills">{['Todos', ...categories].map((item) => <button key={item} className={category === item ? 'filter-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{visibleCourses.length > 0 ? <div className="course-grid library-grid">{visibleCourses.map((course) => <CourseCard key={course.id} course={course} progress={progress[course.id]} onClick={() => onCourseClick(course)} />)}</div> : <div className="empty-state"><span>⌕</span><h3>Não encontrámos cursos</h3><p>Experimenta pesquisar por outro tema ou escolhe uma categoria diferente.</p><button onClick={() => { setSearch(''); setCategory('Todos') }}>Limpar pesquisa</button></div>}</>
}

function NotesBoard({ notes, filter, setFilter, editor, setEditor, onSave, onDelete, onCourseClick }) {
  const visibleNotes = filter === 'all' ? notes : notes.filter((note) => note.courseId === filter)
  const canSave = editor && editor.title.trim() && editor.detail.trim()
  const formatDate = (value) => new Date(value).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })

  return <>
    <div className="library-toolbar notes-toolbar">
      <div className="filter-pills">{[{ id: 'all', title: 'Todos' }, ...courses].map((item) => <button key={item.id} className={filter === item.id ? 'filter-active' : ''} onClick={() => setFilter(item.id)}>{item.title}</button>)}</div>
      {!editor && <button className="primary-button" onClick={() => setEditor({ courseId: filter === 'all' ? courses[0].id : filter, title: '', detail: '' })}>Novo apontamento <Icon name="note" size={15} /></button>}
    </div>
    {editor && <form className="note-editor" onSubmit={(event) => { event.preventDefault(); if (canSave) onSave(editor) }}>
      <div className="note-editor-row">
        <label>Curso<select value={editor.courseId} onChange={(event) => setEditor({ ...editor, courseId: event.target.value })}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <label>Título<input value={editor.title} onChange={(event) => setEditor({ ...editor, title: event.target.value })} placeholder="Ex.: Layouts com Flexbox" autoFocus /></label>
      </div>
      <label>Apontamento<textarea value={editor.detail} onChange={(event) => setEditor({ ...editor, detail: event.target.value })} rows={7} placeholder="Escreve aqui o que aprendeste..." /></label>
      <div className="note-editor-actions">
        <button type="button" className="secondary-button" onClick={() => setEditor(null)}>Cancelar</button>
        <button type="submit" className="primary-button" disabled={!canSave}>{editor.id ? 'Guardar alterações' : 'Guardar apontamento'} <Icon name="check" size={15} /></button>
      </div>
    </form>}
    {visibleNotes.length > 0 ? <div className="notes-grid">{visibleNotes.map((note) => {
      const course = courses.find((item) => item.id === note.courseId)
      return <article className={`note-card note-${course?.color || 'purple'}`} key={note.id}>
        <div className="note-top"><span className="note-subject">{course?.title || 'Sem curso'}</span>{note.updatedAt ? <small className="note-date">{formatDate(note.updatedAt)}</small> : <Icon name="note" size={17} />}</div>
        <h3>{note.title}</h3><p>{note.detail}</p>
        <div className="note-actions">
          {course && <button onClick={() => onCourseClick(course)}>Abrir curso <Icon name="arrow" size={15} /></button>}
          <span>
            <button onClick={() => setEditor({ ...note })}>Editar</button>
            <button className="note-delete" onClick={() => onDelete(note)}>Apagar</button>
          </span>
        </div>
      </article>
    })}</div> : !editor && <div className="empty-state"><span>✎</span><h3>Ainda não tens apontamentos aqui</h3><p>Escreve a tua primeira nota para este curso.</p><button onClick={() => setEditor({ courseId: filter === 'all' ? courses[0].id : filter, title: '', detail: '' })}>Novo apontamento</button></div>}
  </>
}

function CourseDetail({ course, progress, noteCount, onWriteNote, onBack, onOpenLesson, onQuiz }) {
  const completed = countCompleted(course, progress)
  const percent = percentOf(completed, course.lessons.length)
  return <section className="course-detail"><button className="back-link" onClick={onBack}>← Voltar aos cursos</button><div className={`detail-banner art-${course.color}`}><div><span className="course-art-label">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p><div className="detail-meta"><span>{course.level}</span><span><Icon name="clock" size={15} />{course.duration}</span><span>{course.lessons.length} aulas</span></div></div><div className="detail-mark">{course.icon}</div></div><div className="detail-layout"><div><div className="section-title-row detail-title"><div><span className="eyebrow">O TEU PERCURSO</span><h2>Conteúdo do curso</h2></div><span className="detail-count">{completed} / {course.lessons.length} aulas</span></div><div className="lesson-list">{course.lessons.map((lesson, index) => { const isDone = progress?.completed?.includes(lesson.id); return <article className={`lesson-row ${isDone ? 'lesson-done' : ''}`} key={lesson.id} onClick={() => onOpenLesson(lesson)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpenLesson(lesson) }} role="button" tabIndex={0}><span className="lesson-number">{isDone ? <Icon name="check" size={17} /> : String(index + 1).padStart(2, '0')}</span><div><strong>{lesson.title}</strong><small>Aula {index + 1} · {formatDuration(lesson.minutes)}</small></div><button tabIndex={-1}>{isDone ? 'Rever aula' : 'Abrir aula'}</button></article>})}</div></div><aside className="detail-aside"><div className="detail-progress-card"><span className="eyebrow">O TEU PROGRESSO</span><div className="detail-progress-number">{percent}<small>%</small></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><p>{completed} aulas concluídas de {course.lessons.length}</p></div>{onQuiz && <div className="detail-quiz-card"><div className="quiz-promo-icon"><Icon name="spark" size={20} /></div><h3>Pronta para testar os teus conhecimentos?</h3><p>Faz um questionário rápido sobre o que aprendeste.</p><button onClick={onQuiz}>Ver questionários <Icon name="arrow" size={15} /></button></div>}<div className="detail-notes-card"><div className="quiz-promo-icon"><Icon name="note" size={20} /></div><h3>Os teus apontamentos</h3><p>{noteCount === 0 ? 'Ainda não escreveste notas para este curso.' : `Tens ${noteCount} ${noteCount === 1 ? 'apontamento' : 'apontamentos'} neste curso.`}</p><button onClick={onWriteNote}>Escrever apontamento <Icon name="arrow" size={15} /></button></div></aside></div></section>
}

function LessonView({ course, lesson, progress, onBack, onOpenLesson, onComplete }) {
  const index = course.lessons.indexOf(lesson)
  const previous = course.lessons[index - 1]
  const next = course.lessons[index + 1]
  const isDone = progress?.completed?.includes(lesson.id)

  return <section className="lesson-page">
    <button className="back-link" onClick={onBack}>← Voltar a {course.title}</button>
    <header className="lesson-header">
      <span className="eyebrow">Aula {index + 1} de {course.lessons.length} · {formatDuration(lesson.minutes)}</span>
      <h1>{lesson.title}</h1>
    </header>
    <article className="lesson-content"><Markdown remarkPlugins={[remarkGfm]}>{lesson.body}</Markdown></article>
    <div className="lesson-actions">
      {previous && <button className="secondary-button" onClick={() => onOpenLesson(previous)}>← Aula anterior</button>}
      {!isDone ? (
        <button className="primary-button" onClick={() => { onComplete(); if (next) onOpenLesson(next) }}>{next ? 'Concluir e avançar' : 'Concluir aula'} <Icon name="check" size={15} /></button>
      ) : next ? (
        <button className="primary-button" onClick={() => onOpenLesson(next)}>Próxima aula <Icon name="arrow" size={15} /></button>
      ) : (
        <button className="primary-button" onClick={onBack}>Voltar ao curso <Icon name="arrow" size={15} /></button>
      )}
    </div>
  </section>
}

function QuizCard({ quiz, score, onClick }) {
  return <article className="quiz-card"><div className="quiz-card-icon"><Icon name="quiz" size={21} /></div><span className="note-subject">{quiz.subject}</span><h3>{quiz.title}</h3><p>{quiz.questions.length} perguntas · Cerca de 3 minutos</p><button onClick={onClick}>{score !== null && score !== undefined ? `Último resultado: ${score}/${quiz.questions.length}` : 'Começar questionário'} <Icon name="arrow" size={15} /></button></article>
}

function QuizDialog({ quiz, answers, setAnswers, submitted, onSubmit, onClose }) {
  const score = quiz.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0)
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="quiz-title"><button className="modal-close" aria-label="Fechar questionário" onClick={onClose}><Icon name="close" /></button><span className="eyebrow">{quiz.subject} · {quiz.questions.length} PERGUNTAS</span><h2 id="quiz-title">{submitted ? 'Questionário concluído!' : quiz.title}</h2>{submitted ? <div className="quiz-result"><div className="result-score">{score}<span>/{quiz.questions.length}</span></div><p>{score === quiz.questions.length ? 'Excelente! Acertaste em todas. Continua assim!' : 'Boa tentativa! Revê os teus apontamentos e experimenta novamente.'}</p><button className="primary-button" onClick={onClose}>Continuar a aprender</button></div> : <><div className="quiz-questions">{quiz.questions.map((question, index) => <fieldset className="question-block" key={question.question}><legend><span>{String(index + 1).padStart(2, '0')}</span>{question.question}</legend><div className="answer-options">{question.options.map((option, optionIndex) => <label className={`${answers[index] === optionIndex ? 'answer-selected' : ''} ${submitted && optionIndex === question.answer ? 'answer-correct' : ''}`} key={option}><input type="radio" name={`question-${index}`} checked={answers[index] === optionIndex} onChange={() => setAnswers({ ...answers, [index]: optionIndex })} />{option}{submitted && optionIndex === question.answer && <Icon name="check" size={16} />}</label>)}</div></fieldset>)}</div><button className="primary-button quiz-submit" onClick={onSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>Ver as minhas respostas <Icon name="arrow" size={16} /></button>{Object.keys(answers).length !== quiz.questions.length && <span className="quiz-reminder">Responde a todas as perguntas para continuar.</span>}</>}</section></div>
}

export default App
