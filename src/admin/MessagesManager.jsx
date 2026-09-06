// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useEffect, useState, useMemo } from 'react';
import { Mail, Check, Eye, Trash2, RefreshCw } from 'lucide-react';
import { contentRepository } from '../lib/contentRepository';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { ConfirmDialog } from './MediaUploader';
import { useToast } from './Toast';

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('default', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
};

export function MessagesManager({ onMessagesUpdated }) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await contentRepository.loadContactMessages();
      setMessages(data ?? []);
      if (onMessagesUpdated) {
        onMessagesUpdated(data ?? []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load contact messages.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (filter === 'unread') return messages.filter((m) => m.status === 'unread');
    if (filter === 'read') return messages.filter((m) => m.status === 'read');
    return messages;
  }, [messages, filter]);

  const unreadCount = useMemo(() => messages.filter((m) => m.status === 'unread').length, [messages]);

  const toggleStatus = async (msg) => {
    const nextStatus = msg.status === 'unread' ? 'read' : 'unread';
    try {
      await contentRepository.updateContactMessageStatus(msg.id, nextStatus);
      const updatedList = messages.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m));
      setMessages(updatedList);
      if (onMessagesUpdated) onMessagesUpdated(updatedList);
      toast(nextStatus === 'read' ? 'Marked as read' : 'Marked as unread');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update status.';
      toast(message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await contentRepository.deleteContactMessage(pendingDelete.id);
      const updatedList = messages.filter((m) => m.id !== pendingDelete.id);
      setMessages(updatedList);
      if (onMessagesUpdated) onMessagesUpdated(updatedList);
      toast('Message deleted');
      setPendingDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete message.';
      toast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-media-manager">
        <p className="admin-empty-state" role="status">
          Supabase is not configured. Connect your Supabase credentials to store and view contact form submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-media-manager">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="admin-language-switcher" role="group" aria-label="Filter messages">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'admin-language-switcher-active' : undefined}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'admin-language-switcher-active' : undefined}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={filter === 'read' ? 'admin-language-switcher-active' : undefined}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          disabled={loading}
          className="admin-button-secondary gap-2 text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <p className="admin-message" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-empty-state" role="status">Loading messages...</p>
      ) : filteredMessages.length === 0 ? (
        <p className="admin-empty-state" role="status">
          {filter === 'unread'
            ? 'No unread messages.'
            : filter === 'read'
            ? 'No read messages.'
            : 'No contact form messages received yet.'}
        </p>
      ) : (
        <div className="admin-media-list space-y-4">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === 'unread';
            return (
              <div
                key={msg.id}
                className={`admin-media-card p-5 transition-colors ${
                  isUnread ? 'border-l-4 border-l-brand-gold bg-brand-surface' : 'opacity-85'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-base text-white">{msg.name}</strong>
                      {isUnread && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-gold text-black">
                          Unread
                        </span>
                      )}
                      {msg.category && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 text-white/60">
                          {msg.category}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-1 flex items-center gap-2">
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-brand-gold hover:underline flex items-center gap-1"
                      >
                        <Mail size={12} />
                        {msg.email}
                      </a>
                      <span>•</span>
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  </div>

                  <div className="admin-action-row">
                    <button
                      type="button"
                      onClick={() => toggleStatus(msg)}
                      className="admin-button-secondary text-xs flex items-center gap-1.5"
                    >
                      {isUnread ? (
                        <>
                          <Check size={14} />
                          Mark as read
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Mark as unread
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingDelete(msg)}
                      className="admin-button-danger text-xs flex items-center gap-1.5"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete contact message?"
          description={`Are you sure you want to delete the message from ${pendingDelete.name}? This action cannot be undone.`}
          isDeleting={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
