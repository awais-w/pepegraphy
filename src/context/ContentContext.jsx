// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultContent } from '../lib/contentModel';
import { contentRepository } from '../lib/contentRepository';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadStarted = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setContent(await contentRepository.loadContent());
      setError(contentRepository.getLoadError());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error('Unable to refresh content.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const value = useMemo(() => {
    const mutations = Object.fromEntries(Object.entries(contentRepository)
      .filter(([name, method]) => name !== 'loadContent' && name !== 'getLoadError' && typeof method === 'function')
      .map(([name, method]) => [name, async (...args) => {
        const result = await method(...args);
        await refresh();
        return result;
      }]));

    return { content, loading, error, refresh, ...mutations };
  }, [content, error, loading, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// Exported alongside the provider so consumers share the module-local context.
// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider.');
  return context;
}
