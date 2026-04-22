import { useCallback, useEffect, useReducer } from 'react';
import { tasksApi } from '../api/client';

const initialState = {
  tasks:   [],
  meta:    { total: 0, page: 1, limit: 20, pages: 1 },
  loading: false,
  error:   null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':  return { ...state, loading: true,  error: null };
    case 'FETCH_OK':     return { ...state, loading: false, tasks: action.tasks, meta: action.meta };
    case 'FETCH_ERR':    return { ...state, loading: false, error: action.error };
    case 'ADD':          return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE':       return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };
    case 'REMOVE':       return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    default:             return state;
  }
}

export function useTasks(filters = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await tasksApi.list(filters);
      dispatch({ type: 'FETCH_OK', tasks: res.data, meta: res.meta });
    } catch (err) {
      dispatch({ type: 'FETCH_ERR', error: err.message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  const createTask = useCallback(async (body) => {
    const { data } = await tasksApi.create(body);
    dispatch({ type: 'ADD', task: data });
    return data;
  }, []);

  const updateTask = useCallback(async (id, body) => {
    const { data } = await tasksApi.update(id, body);
    dispatch({ type: 'UPDATE', task: data });
    return data;
  }, []);

  const removeTask = useCallback(async (id) => {
    await tasksApi.remove(id);
    dispatch({ type: 'REMOVE', id });
  }, []);

  return { ...state, reload: load, createTask, updateTask, removeTask };
}
