import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import styles from './Dashboard.module.css';

const STATUSES  = ['', 'todo', 'in_progress', 'done'];
const PRIORITIES = ['', 'low', 'medium', 'high'];

const STATUS_LABELS = { '': 'All', todo: 'To do', in_progress: 'In progress', done: 'Done' };
const PRIORITY_LABELS = { '': 'Any priority', low: 'Low', medium: 'Medium', high: 'High' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [statusFilter,   setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modal, setModal]                   = useState(null); // null | 'new' | task object

  const filters = {};
  if (statusFilter)   filters.status   = statusFilter;
  if (priorityFilter) filters.priority = priorityFilter;

  const { tasks, meta, loading, error, createTask, updateTask, removeTask } = useTasks(filters);

  async function handleSave(data) {
    if (modal === 'new') {
      await createTask(data);
    } else {
      await updateTask(modal.id, data);
    }
    setModal(null);
  }

  async function handleStatusToggle(task) {
    const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    await updateTask(task.id, { status: next });
  }

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <span className={styles.logo}>T</span>
            <span className={styles.wordmark}>TaskFlow</span>
          </div>

          <button className={styles.newBtn} onClick={() => setModal('new')}>
            <span>+</span> New task
          </button>

          <nav className={styles.nav}>
            <p className={styles.navLabel}>Status</p>
            {STATUSES.map(s => (
              <button
                key={s}
                className={statusFilter === s ? styles.navItemActive : styles.navItem}
                onClick={() => setStatusFilter(s)}
              >
                {s && <span className={`${styles.dot} ${styles[`dot_${s}`]}`} />}
                {STATUS_LABELS[s]}
              </button>
            ))}
          </nav>

          <nav className={styles.nav}>
            <p className={styles.navLabel}>Priority</p>
            {PRIORITIES.map(p => (
              <button
                key={p}
                className={priorityFilter === p ? styles.navItemActive : styles.navItem}
                onClick={() => setPriorityFilter(p)}
              >
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.sideBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{user?.name?.[0] ?? '?'}</div>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>
              {STATUS_LABELS[statusFilter] || 'All tasks'}
            </h1>
            <p className={styles.subheading}>
              {loading ? 'Loading…' : `${meta.total} task${meta.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {!loading && tasks.length === 0 && (
          <div className={styles.empty}>
            <p>No tasks yet.</p>
            <button className={styles.emptyBtn} onClick={() => setModal('new')}>
              Create your first task →
            </button>
          </div>
        )}

        <div className={styles.grid}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setModal(task)}
              onDelete={() => removeTask(task.id)}
              onCycleStatus={() => handleStatusToggle(task)}
            />
          ))}
        </div>
      </main>

      {modal !== null && (
        <TaskModal
          initial={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
