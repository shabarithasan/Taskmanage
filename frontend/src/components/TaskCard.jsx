import styles from './TaskCard.module.css';

const PRIORITY_CLASS = { low: 'prioLow', medium: 'prioMed', high: 'prioHigh' };
const STATUS_LABEL   = { todo: 'To do', in_progress: 'In progress', done: 'Done' };

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TaskCard({ task, onEdit, onDelete, onCycleStatus }) {
  const overdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <div className={`${styles.card} ${task.status === 'done' ? styles.done : ''}`}>
      <div className={styles.top}>
        <span className={`${styles.prio} ${styles[PRIORITY_CLASS[task.priority]]}`}>
          {task.priority}
        </span>
        <div className={styles.actions}>
          <button className={styles.action} onClick={onEdit}  title="Edit">✎</button>
          <button className={`${styles.action} ${styles.actionDel}`} onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>

      <button className={styles.titleBtn} onClick={onEdit}>
        <h3 className={styles.title}>{task.title}</h3>
      </button>

      {task.description && (
        <p className={styles.desc}>{task.description}</p>
      )}

      <div className={styles.footer}>
        <button className={`${styles.status} ${styles[`status_${task.status}`]}`} onClick={onCycleStatus}>
          {STATUS_LABEL[task.status]}
        </button>

        {task.due_date && (
          <span className={`${styles.due} ${overdue ? styles.overdue : ''}`}>
            {overdue ? '⚠ ' : ''}{fmt(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
