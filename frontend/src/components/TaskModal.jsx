import { useEffect, useRef, useState } from 'react';
import styles from './TaskModal.module.css';

const BLANK = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' };

export default function TaskModal({ initial, onSave, onClose }) {
  const [fields, setFields] = useState(initial ? {
    title:       initial.title       ?? '',
    description: initial.description ?? '',
    status:      initial.status      ?? 'todo',
    priority:    initial.priority    ?? 'medium',
    due_date:    initial.due_date    ? initial.due_date.slice(0, 10) : '',
  } : { ...BLANK });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);
  const titleRef   = useRef(null);

  function set(k, v) { setFields(f => ({ ...f, [k]: v })); }

  useEffect(() => {
    titleRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!fields.title.trim()) { setError('Title is required.'); return; }
    setBusy(true);
    try {
      await onSave({
        ...fields,
        due_date: fields.due_date || null,
      });
    } catch (err) {
      setError(err.message || 'Could not save task.');
      setBusy(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={initial ? 'Edit task' : 'New task'}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{initial ? 'Edit task' : 'New task'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span>Title *</span>
            <input
              ref={titleRef}
              type="text" required
              value={fields.title}
              onChange={e => set('title', e.target.value)}
              placeholder="What needs doing?"
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              rows={3}
              value={fields.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details…"
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Status</span>
              <select value={fields.status} onChange={e => set('status', e.target.value)}>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Priority</span>
              <select value={fields.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Due date</span>
              <input type="date" value={fields.due_date} onChange={e => set('due_date', e.target.value)} />
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={busy}>
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
