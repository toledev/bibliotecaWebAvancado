import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Grid2X2,
  Library,
  List,
  LogOut,
  Menu,
  Minus,
  MoreHorizontal,
  Pencil,
  PanelLeft,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tags,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { apiRequest } from './api.js';

const genres = ['Romance', 'Technology', 'History', 'Science', 'Education', 'Brainrot'];
const memberStatuses = ['Active', 'Suspended'];
const loanStatuses = {
  Active: 'Ativo',
  ReturnedOnTime: 'Devolvido',
  ReturnedLate: 'Devolvido com atraso',
};

const emptyBook = {
  title: '',
  isbn: '',
  publishedYear: new Date().getFullYear(),
  genre: 'Technology',
  copiesAvailable: 1,
  authorId: '',
};

const emptyMember = {
  fullName: '',
  email: '',
  birthDate: '',
  status: 'Active',
};

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('biblioteca.session');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('catalog');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('biblioteca.favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [formVisible, setFormVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const bookFormRef = useRef(null);

  async function refreshAll(showToast = false) {
    setLoading(true);
    try {
      const [me, booksData, authorsData, membersData, loansData, overdueData] = await Promise.all([
        apiRequest('/auth/me'),
        apiRequest('/books'),
        apiRequest('/authors'),
        apiRequest('/members'),
        apiRequest('/loans'),
        apiRequest('/loans/overdue'),
      ]);

      setProfile(me);
      setBooks(booksData ?? []);
      setAuthors(authorsData ?? []);
      setMembers(membersData ?? []);
      setLoans(loansData ?? []);
      setOverdue(overdueData ?? []);

      if (showToast) {
        showMessage('Dados atualizados.', 'success');
      }
    } catch (error) {
      showMessage(error.message, 'error');
      if (!localStorage.getItem('biblioteca.token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      refreshAll();
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('biblioteca.favorites', JSON.stringify(favorites));
  }, [favorites]);

  function showMessage(message, type = 'success') {
    setToast({ message, type });
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => setToast(null), 3000);
  }

  function handleLogin(data) {
    localStorage.setItem('biblioteca.token', data.token);
    localStorage.setItem('biblioteca.session', JSON.stringify(data));
    setSession(data);
  }

  function handleLogout() {
    localStorage.removeItem('biblioteca.token');
    localStorage.removeItem('biblioteca.session');
    setSession(null);
    setProfile(null);
  }

  function openNewBookForm() {
    setActiveSection('catalog');
    setFormVisible(true);
    setMobileOpen(false);
    window.setTimeout(() => bookFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function toggleFavorite(bookId) {
    setFavorites((current) => (
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId]
    ));
  }

  const stats = useMemo(() => {
    const activeLoans = loans.filter((loan) => loan.status === 'Active').length;
    const availableCopies = books.reduce((sum, book) => sum + book.copiesAvailable, 0);

    return [
      { label: 'Catálogo', value: books.length, icon: BookOpen },
      { label: 'Favoritos', value: favorites.length, icon: Star },
      { label: 'Exemplares', value: availableCopies, icon: Library },
      { label: 'Empréstimos', value: activeLoans, icon: ArrowLeftRight },
    ];
  }, [books, loans, favorites]);

  const categories = useMemo(() => {
    return genres.map((genre) => ({
      name: genre,
      count: books.filter((book) => book.genre === genre).length,
    }));
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const status = getBookStatus(book).label;
      const searchable = `${book.title} ${book.authorName} ${book.isbn} ${book.genre} ${status}`.toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || book.genre === filter || status === filter;
      const matchesFavorite = !favoritesOnly || favorites.includes(book.id);

      return matchesQuery && matchesFilter && matchesFavorite;
    });
  }, [books, query, filter, favoritesOnly, favorites]);

  const catalogSections = ['catalog', 'favorites'];

  if (!session) {
    return <LoginScreen onLogin={handleLogin} showMessage={showMessage} toast={toast} />;
  }

  return (
    <main className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMobileOpen(false);
          if (section === 'favorites') {
            setFavoritesOnly(true);
          }
          if (section === 'catalog') {
            setFavoritesOnly(false);
          }
        }}
        onNewBook={openNewBookForm}
        onLogout={handleLogout}
        profile={profile}
        session={session}
        open={mobileOpen}
      />

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}

      <section className="main-area">
        <header className="page-header">
          <div className="title-row">
            <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} title="Abrir menu">
              <Menu size={18} />
            </button>
            <div>
              <h1>Biblioteca</h1>
              <p>Catálogo digital organizado para consulta, cadastro e empréstimos.</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => refreshAll(true)} disabled={loading} title="Atualizar">
              <RefreshCcw size={17} />
            </button>
          </div>
        </header>

        {catalogSections.includes(activeSection) && (
          <CatalogSection
            authors={authors}
            books={filteredBooks}
            allBooks={books}
            favorites={favorites}
            favoritesOnly={favoritesOnly}
            filter={filter}
            query={query}
            viewMode={viewMode}
            formVisible={formVisible}
            formRef={bookFormRef}
            loading={loading}
            onChanged={refreshAll}
            onEditStart={() => setFormVisible(true)}
            onFilterChange={setFilter}
            onFavoritesOnlyChange={setFavoritesOnly}
            onQueryChange={setQuery}
            onToggleFavorite={toggleFavorite}
            onViewModeChange={setViewMode}
            onCloseForm={() => setFormVisible(false)}
            showMessage={showMessage}
          />
        )}

        {activeSection === 'loans' && (
          <LoansPanel
            books={books}
            members={members}
            loans={loans}
            overdue={overdue}
            onChanged={refreshAll}
            showMessage={showMessage}
          />
        )}
        {activeSection === 'authors' && (
          <AuthorsPanel authors={authors} onChanged={refreshAll} showMessage={showMessage} />
        )}
        {activeSection === 'readers' && (
          <MembersPanel members={members} onChanged={refreshAll} showMessage={showMessage} />
        )}
        {activeSection === 'categories' && (
          <CategoriesPanel categories={categories} books={books} />
        )}
        <section className="stats-strip" aria-label="Resumo">
          {stats.map((stat) => <Stat key={stat.label} {...stat} />)}
        </section>
      </section>

      {toast && <Toast {...toast} />}
    </main>
  );
}

function Sidebar({ activeSection, onSectionChange, onNewBook, onLogout, profile, session, open }) {
  const menuItems = [
    { id: 'catalog', label: 'Catálogo', icon: BookOpen },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'loans', label: 'Empréstimos', icon: ArrowLeftRight },
    { id: 'readers', label: 'Leitores', icon: Users },
    { id: 'authors', label: 'Autores', icon: UserRound },
    { id: 'categories', label: 'Categorias', icon: Tags },
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">
          <Library size={18} />
          <strong>Biblioteca</strong>
        </div>
        <button className="collapse-button" title="Sidebar">
          <PanelLeft size={15} />
        </button>
      </div>

      <button className="new-book-button" onClick={onNewBook}>
        <Plus size={16} />
        Novo livro
      </button>

      <nav className="side-menu" aria-label="Menu principal">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={selected ? 'active' : ''}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="session-card">
          <ShieldCheck size={16} />
          <strong>{profile?.name ?? session.name}</strong>
        </div>
        <div className="footer-actions">
          <button title="Sair" onClick={onLogout}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function CatalogSection({
  authors,
  books,
  allBooks,
  favorites,
  favoritesOnly,
  filter,
  query,
  viewMode,
  formVisible,
  formRef,
  loading,
  onChanged,
  onEditStart,
  onFilterChange,
  onFavoritesOnlyChange,
  onQueryChange,
  onToggleFavorite,
  onViewModeChange,
  onCloseForm,
  showMessage,
}) {
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  async function saveBook(event) {
    event.preventDefault();
    const payload = {
      ...form,
      publishedYear: Number(form.publishedYear),
      copiesAvailable: Number(form.copiesAvailable),
      authorId: Number(form.authorId),
    };

    try {
      await apiRequest(editingId ? `/books/${editingId}` : '/books', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      showMessage(editingId ? 'Livro atualizado.' : 'Livro cadastrado.', 'success');
      setEditingId(null);
      setForm(emptyBook);
      onCloseForm();
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  async function patchCopies(book, copiesAvailable) {
    try {
      await apiRequest(`/books/${book.id}/copies`, {
        method: 'PATCH',
        body: JSON.stringify({ copiesAvailable }),
      });
      showMessage('Exemplares atualizados.', 'success');
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  async function deleteBook(book) {
    try {
      await apiRequest(`/books/${book.id}`, { method: 'DELETE' });
      showMessage('Livro removido.', 'success');
      setBookToDelete(null);
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  function editBook(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      genre: book.genre,
      copiesAvailable: book.copiesAvailable,
      authorId: book.authorId,
    });
    onEditStart();
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyBook);
    onCloseForm();
  }

  return (
    <>
      <TopBar
        filter={filter}
        favoritesOnly={favoritesOnly}
        query={query}
        viewMode={viewMode}
        onFilterChange={onFilterChange}
        onFavoritesOnlyChange={onFavoritesOnlyChange}
        onQueryChange={onQueryChange}
        onViewModeChange={onViewModeChange}
      />

      {formVisible && (
        <section className="book-form-card" ref={formRef}>
          <div className="section-heading">
            <div>
              <h2>{editingId ? 'Editar livro' : 'Cadastrar novo livro'}</h2>
              <p>Preencha os dados do acervo e salve para atualizar o catálogo.</p>
            </div>
            <button className="icon-button quiet" onClick={resetForm} title="Fechar formulário">
              <X size={16} />
            </button>
          </div>
          <form className="book-form" onSubmit={saveBook}>
            <label>
              Título
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
            <label>
              ISBN
              <input value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} required />
            </label>
            <label>
              Ano
              <input
                type="number"
                min="1450"
                max="2100"
                value={form.publishedYear}
                onChange={(event) => setForm({ ...form, publishedYear: event.target.value })}
                required
              />
            </label>
            <label className="select-label">
              Categoria
              <select value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })}>
                {genres.map((genre) => <option key={genre}>{genre}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
            <label>
              Exemplares
              <input
                type="number"
                min="0"
                value={form.copiesAvailable}
                onChange={(event) => setForm({ ...form, copiesAvailable: event.target.value })}
                required
              />
            </label>
            <label className="select-label">
              Autor
              <select value={form.authorId} onChange={(event) => setForm({ ...form, authorId: event.target.value })} required>
                <option value="">Selecione</option>
                {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
            <div className="form-actions">
              <button className="primary-button">
                <Save size={16} />
                {editingId ? 'Salvar alterações' : 'Cadastrar livro'}
              </button>
              <button type="button" className="ghost-button" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className={viewMode === 'grid' ? 'book-grid' : 'book-list'}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            favorite={favorites.includes(book.id)}
            viewMode={viewMode}
            onToggleFavorite={() => onToggleFavorite(book.id)}
            onEdit={() => editBook(book)}
            onDelete={() => setBookToDelete(book)}
            onDecrease={() => patchCopies(book, Math.max(0, book.copiesAvailable - 1))}
            onIncrease={() => patchCopies(book, book.copiesAvailable + 1)}
          />
        ))}
      </section>

      {!loading && books.length === 0 && (
        <EmptyState
          title="Nenhum livro encontrado"
          description={allBooks.length === 0 ? 'Cadastre o primeiro livro para começar.' : 'Ajuste a busca ou filtros para ver mais resultados.'}
        />
      )}

      {bookToDelete && (
        <ConfirmDialog
          title="Excluir livro?"
          description={`Essa ação tentará remover "${bookToDelete.title}" do catálogo. Livros com histórico de empréstimos não podem ser excluídos pela API.`}
          confirmLabel="Excluir"
          onCancel={() => setBookToDelete(null)}
          onConfirm={() => deleteBook(bookToDelete)}
        />
      )}
    </>
  );
}

function TopBar({
  filter,
  favoritesOnly,
  query,
  viewMode,
  onFilterChange,
  onFavoritesOnlyChange,
  onQueryChange,
  onViewModeChange,
}) {
  return (
    <div className="catalog-toolbar">
      <div className="toolbar-left">
        <label className="filter-select">
          <SlidersHorizontal size={15} />
          <select value={filter} onChange={(event) => onFilterChange(event.target.value)} aria-label="Filtro">
            <option value="all">Todos</option>
            <option value="Disponível">Disponíveis</option>
            <option value="Emprestado">Emprestados</option>
            <option value="Reservado">Reservados</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </label>
        <button
          className={`favorite-filter ${favoritesOnly ? 'active' : ''}`}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Star size={15} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Meus favoritos
        </button>
      </div>
      <div className="toolbar-right">
        <SearchInput value={query} onChange={onQueryChange} />
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <label className="search-input">
      <Search size={15} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar livros"
      />
    </label>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle" aria-label="Modo de visualização">
      <button className={value === 'grid' ? 'active' : ''} onClick={() => onChange('grid')} title="Grade">
        <Grid2X2 size={15} />
      </button>
      <button className={value === 'list' ? 'active' : ''} onClick={() => onChange('list')} title="Lista">
        <List size={16} />
      </button>
    </div>
  );
}

function BookCard({ book, favorite, viewMode, onToggleFavorite, onEdit, onDelete, onDecrease, onIncrease }) {
  const status = getBookStatus(book);

  return (
    <article className={`book-card ${viewMode}`}>
      <div className="card-top">
        <div className="book-icon">
          <BookOpen size={17} />
        </div>
        <div className="card-actions">
          <button
            className={`star-button ${favorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-button mini" title="Mais opções">
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>

      <div className="book-body">
        <h2>{book.title}</h2>
        <p>{book.authorName || 'Autor não informado'}</p>
        <span>{book.genre} · {book.publishedYear} · ISBN {book.isbn}</span>
      </div>

      <div className="card-bottom">
        <StatusPill status={status} />
        <div className="copy-stepper" aria-label="Exemplares">
          <button onClick={onDecrease} title="Diminuir exemplares">
            <Minus size={13} />
          </button>
          <strong>{book.copiesAvailable}</strong>
          <button onClick={onIncrease} title="Aumentar exemplares">
            <Plus size={13} />
          </button>
        </div>
        <div className="book-row-actions">
          <button onClick={onEdit} title="Editar livro">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} title="Remover livro">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function AuthorsPanel({ authors, onChanged, showMessage }) {
  const [form, setForm] = useState({ name: '', nationality: '' });

  async function submit(event) {
    event.preventDefault();
    try {
      await apiRequest('/authors', { method: 'POST', body: JSON.stringify(form) });
      showMessage('Autor cadastrado.', 'success');
      setForm({ name: '', nationality: '' });
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  return (
    <section className="management-grid">
      <form className="simple-card form-card" onSubmit={submit}>
        <SectionHeading title="Novo autor" description="Adicione autores usados no cadastro de livros." icon={UserRound} />
        <label>
          Nome
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Nacionalidade
          <input value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} />
        </label>
        <button className="primary-button"><Plus size={16} />Cadastrar</button>
      </form>

      <section className="simple-card">
        <SectionHeading title="Autores" description={`${authors.length} autor(es) no sistema.`} icon={Users} />
        <div className="entity-list">
          {authors.map((author) => (
            <article className="entity-row" key={author.id}>
              <UserRound size={16} />
              <div>
                <strong>{author.name}</strong>
                <span>{author.nationality || 'Nacionalidade não informada'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function MembersPanel({ members, onChanged, showMessage }) {
  const [form, setForm] = useState(emptyMember);

  async function submit(event) {
    event.preventDefault();
    try {
      await apiRequest('/members', { method: 'POST', body: JSON.stringify(form) });
      showMessage('Leitor cadastrado.', 'success');
      setForm(emptyMember);
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  return (
    <section className="management-grid">
      <form className="simple-card form-card" onSubmit={submit}>
        <SectionHeading title="Novo leitor" description="Cadastre usuários aptos a realizar empréstimos." icon={Users} />
        <label>
          Nome completo
          <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        </label>
        <label>
          E-mail
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <div className="form-grid">
          <label>
            Nascimento
            <input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} required />
          </label>
          <label className="select-label">
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {memberStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        <button className="primary-button"><Plus size={16} />Cadastrar</button>
      </form>

      <section className="simple-card">
        <SectionHeading title="Leitores" description={`${members.length} usuário(s) cadastrados.`} icon={Users} />
        <div className="entity-list">
          {members.map((member) => (
            <article className="entity-row" key={member.id}>
              <UserRound size={16} />
              <div>
                <strong>{member.fullName}</strong>
                <span>{member.email} · {member.age} anos</span>
              </div>
              <SmallPill tone={member.status === 'Active' ? 'good' : 'neutral'}>{member.status}</SmallPill>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function LoansPanel({ books, members, loans, overdue, onChanged, showMessage }) {
  const [form, setForm] = useState({ bookId: '', memberId: '' });
  const availableBooks = books.filter((book) => book.copiesAvailable > 0);
  const activeMembers = members.filter((member) => member.status === 'Active');

  async function createLoan(event) {
    event.preventDefault();
    try {
      await apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify({ bookId: Number(form.bookId), memberId: Number(form.memberId) }),
      });
      showMessage('Empréstimo criado.', 'success');
      setForm({ bookId: '', memberId: '' });
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  async function returnLoan(loan) {
    try {
      await apiRequest(`/loans/${loan.id}/return`, {
        method: 'PUT',
        body: JSON.stringify({ returnDate: new Date().toISOString().slice(0, 10) }),
      });
      showMessage('Devolução registrada.', 'success');
      await onChanged();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  return (
    <section className="management-grid">
      <form className="simple-card form-card" onSubmit={createLoan}>
        <SectionHeading title="Novo empréstimo" description="Selecione um livro disponível e um leitor ativo." icon={ArrowLeftRight} />
        <label className="select-label">
          Livro
          <select value={form.bookId} onChange={(event) => setForm({ ...form, bookId: event.target.value })} required>
            <option value="">Selecione</option>
            {availableBooks.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
        <label className="select-label">
          Leitor
          <select value={form.memberId} onChange={(event) => setForm({ ...form, memberId: event.target.value })} required>
            <option value="">Selecione</option>
            {activeMembers.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
        <button className="primary-button"><Plus size={16} />Registrar</button>
      </form>

      <section className="simple-card">
        <SectionHeading title="Empréstimos" description={`${overdue.length} empréstimo(s) ativo(s) em atraso.`} icon={ArrowLeftRight} />
        <div className="entity-list">
          {loans.map((loan) => (
            <article className="entity-row" key={loan.id}>
              <BookOpen size={16} />
              <div>
                <strong>{loan.bookTitle}</strong>
                <span>{loan.memberName} · prazo {formatDate(loan.dueDate)} · multa {formatCurrency(loan.fine)}</span>
              </div>
              <SmallPill tone={loan.status === 'Active' ? 'warn' : 'good'}>{loanStatuses[loan.status] ?? loan.status}</SmallPill>
              {loan.status === 'Active' && (
                <button className="small-action" onClick={() => returnLoan(loan)} title="Registrar devolução">
                  <Check size={14} />
                </button>
              )}
            </article>
          ))}
          {loans.length === 0 && <EmptyState title="Nenhum empréstimo" description="Os registros aparecerão aqui." />}
        </div>
      </section>
    </section>
  );
}

function CategoriesPanel({ categories, books }) {
  return (
    <section className="simple-card">
      <SectionHeading title="Categorias" description="Distribuição do acervo por gênero." icon={Tags} />
      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.name}>
            <Tags size={16} />
            <strong>{category.name}</strong>
            <span>{category.count} livro(s)</span>
          </article>
        ))}
      </div>
      <div className="muted-note">Total no catálogo: {books.length} livro(s).</div>
    </section>
  );
}

function LoginScreen({ onLogin, showMessage, toast }) {
  const [form, setForm] = useState({ email: 'admin@biblioteca.com', password: 'biblioteca123' });
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onLogin(data);
      showMessage('Login realizado com sucesso.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-card">
        <div className="brand">
          <Library size={18} />
          <strong>Biblioteca</strong>
        </div>
        <div className="login-copy">
          <h1>Entrar</h1>
          <p>Acesse o painel para administrar catálogo, leitores e empréstimos.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="primary-button" disabled={submitting}>
            <ShieldCheck size={16} />
            {submitting ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </section>
      {toast && <Toast {...toast} />}
    </main>
  );
}

function SectionHeading({ title, description, icon: Icon }) {
  return (
    <div className="section-heading">
      <Icon size={17} />
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <article className="stat-card">
      <Icon size={15} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusPill({ status }) {
  return <span className={`status-pill ${status.tone}`}>{status.label}</span>;
}

function SmallPill({ children, tone = 'neutral' }) {
  return <span className={`small-pill ${tone}`}>{children}</span>;
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <BookOpen size={20} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}
      <span>{message}</span>
    </div>
  );
}

function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="confirm-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-icon">
          <CircleAlert size={18} />
        </div>
        <div>
          <h2 id="confirm-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="confirm-actions">
          <button className="ghost-button" onClick={onCancel}>Cancelar</button>
          <button className="danger-button" onClick={onConfirm}>
            <Trash2 size={15} />
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function getBookStatus(book) {
  if (book.copiesAvailable > 0) {
    return { label: 'Disponível', tone: 'available' };
  }
  if (book.activeLoans > 0) {
    return { label: 'Emprestado', tone: 'borrowed' };
  }
  return { label: 'Reservado', tone: 'reserved' };
}

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
