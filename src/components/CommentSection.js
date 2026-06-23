'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translateText, detectLanguage, moderateComment, getLangName } from '@/utils/translation';
import { MOCK_COMMENTS, LANGUAGES } from '@/utils/data';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';

export default function CommentSection({ videoId }) {
  const { user, addToast, location } = useApp();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [translatingId, setTranslatingId] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`sn_comments_${videoId}`);
    if (saved) {
      try { setComments(JSON.parse(saved)); return; } catch {}
    }
    setComments(MOCK_COMMENTS);
  }, [videoId]);

  function saveComments(updated) {
    setComments(updated);
    localStorage.setItem(`sn_comments_${videoId}`, JSON.stringify(updated));
  }

  async function handlePost() {
    if (!user) { addToast({ type: 'warning', title: 'Sign in required', message: 'Please sign in to comment.' }); return; }
    const text = newComment.trim();
    const { valid, reason } = moderateComment(text);
    if (!valid) { addToast({ type: 'error', title: 'Invalid comment', message: reason }); return; }

    setPosting(true);
    const detected = detectLanguage(text);
    const comment = {
      id: `c_${Date.now()}`,
      userId: user.id || 'me',
      userName: user.name,
      city: location?.city || 'Unknown',
      text,
      originalText: detected !== 'en' ? text : null,
      originalLang: detected,
      translatedText: null,
      timestamp: 'just now',
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    };
    saveComments([comment, ...comments]);
    setNewComment('');
    setPosting(false);
    addToast({ type: 'success', title: 'Comment posted!', message: 'Your comment is live.' });
  }

  async function handleTranslate(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    if (comment.translatedText) {
      saveComments(comments.map(c => c.id === commentId ? { ...c, showTranslated: !c.showTranslated } : c));
      return;
    }
    setTranslatingId(commentId);
    try {
      const { translated } = await translateText(comment.text, preferredLang, comment.originalLang);
      saveComments(comments.map(c =>
        c.id === commentId ? { ...c, translatedText: translated, showTranslated: true } : c
      ));
    } catch {
      addToast({ type: 'error', title: 'Translation failed', message: 'Could not translate. Try again.' });
    }
    setTranslatingId(null);
  }

  function handleLike(commentId) {
    if (!user) { addToast({ type: 'warning', title: 'Sign in required', message: 'Sign in to like comments.' }); return; }
    const uid = user.id || 'me';
    setComments(prev => {
      const updated = prev.map(c => {
        if (c.id !== commentId) return c;
        const liked = c.likedBy.includes(uid);
        return {
          ...c,
          likedBy: liked ? c.likedBy.filter(id => id !== uid) : [...c.likedBy, uid],
          dislikedBy: c.dislikedBy.filter(id => id !== uid),
          likes: liked ? c.likes - 1 : c.likes + 1,
          dislikes: c.dislikedBy.includes(uid) ? c.dislikes - 1 : c.dislikes,
        };
      });
      localStorage.setItem(`sn_comments_${videoId}`, JSON.stringify(updated));
      return updated;
    });
  }

  function handleDislike(commentId) {
    if (!user) { addToast({ type: 'warning', title: 'Sign in required', message: 'Sign in to dislike comments.' }); return; }
    const uid = user.id || 'me';
    setComments(prev => {
      const updated = prev.map(c => {
        if (c.id !== commentId) return c;
        const disliked = c.dislikedBy.includes(uid);
        const newDislikes = disliked ? c.dislikes - 1 : c.dislikes + 1;
        const newDislikedBy = disliked ? c.dislikedBy.filter(id => id !== uid) : [...c.dislikedBy, uid];
        const likedBefore = c.likedBy.includes(uid);
        return {
          ...c,
          dislikedBy: newDislikedBy,
          likedBy: likedBefore ? c.likedBy.filter(id => id !== uid) : c.likedBy,
          dislikes: newDislikes,
          likes: likedBefore ? c.likes - 1 : c.likes,
          toRemove: newDislikes >= 2,
        };
      }).filter(c => !c.toRemove);
      localStorage.setItem(`sn_comments_${videoId}`, JSON.stringify(updated));
      if (updated.length < prev.length) {
        addToast({ type: 'info', title: 'Comment removed', message: 'This comment was removed by the community.' });
      }
      return updated;
    });
  }

  const needsTranslation = (c) => c.originalLang && c.originalLang !== preferredLang;

  return (
    <div className="comment-section">
      <div className="comment-section-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.25rem', fontWeight: 800 }}>
        <FiMessageSquare size={22} color="var(--accent)" />
        {comments.length} Comments
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Translate to:</span>
          <select
            className="comment-lang-select"
            value={preferredLang}
            onChange={e => setPreferredLang(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Post Comment */}
      <div className="comment-form">
        <div className="avatar">
          {user ? (user.name?.[0]?.toUpperCase() || 'U') : 'U'}
        </div>
        <div className="comment-input-wrap">
          <textarea
            className="comment-input"
            placeholder={user ? `Comment as ${user.name}... (any language)` : 'Sign in to comment...'}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={!user || posting}
            rows={2}
          />
          <div className="comment-meta-row">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {location?.city || 'Your city'} • AI-powered translation enabled
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePost}
              disabled={!user || posting || !newComment.trim()}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div>
        {comments.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <div className="empty-state-title">No comments yet</div>
            <div className="empty-state-desc">Be the first to share your thoughts!</div>
          </div>
        )}
        {comments.map(comment => {
          const isLiked = comment.likedBy?.includes(user?.id || 'me');
          const isDisliked = comment.dislikedBy?.includes(user?.id || 'me');
          const showTranslate = needsTranslation(comment);
          const isTranslating = translatingId === comment.id;

          return (
            <div key={comment.id} className="comment-item">
              <div className="avatar avatar-sm">
                {comment.userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-name">{comment.userName}</span>
                  <span className="comment-city">{comment.city}</span>
                  {comment.originalLang && comment.originalLang !== 'en' && (
                    <span style={{
                      fontSize: '0.7rem', padding: '1px 6px',
                      background: 'rgba(99,102,241,0.1)', color: 'var(--accent)',
                      borderRadius: 4, fontWeight: 600,
                    }}>
                      {getLangName(comment.originalLang)}
                    </span>
                  )}
                  <span className="comment-time" style={{ marginLeft: 'auto' }}>{comment.timestamp}</span>
                </div>

                {/* Comment text - show translated or original */}
                {comment.showTranslated && comment.translatedText ? (
                  <>
                    <div className="comment-text">{comment.translatedText}</div>
                    <div className="comment-original">Original: {comment.text}</div>
                    <span className="comment-translated-badge">AI Translated · {getLangName(comment.originalLang)} -&gt; {getLangName(preferredLang)}</span>
                  </>
                ) : (
                  <div className="comment-text">{comment.text}</div>
                )}

                {/* Translate button */}
                {showTranslate && (
                  <button className="translate-btn" onClick={() => handleTranslate(comment.id)} disabled={isTranslating}>
                    {isTranslating ? 'Translating...' : (comment.showTranslated ? 'Show original' : `Translate to ${getLangName(preferredLang)}`)}
                  </button>
                )}

                <div className="comment-actions" style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    className={`comment-action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(comment.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: isLiked ? 'var(--accent)' : 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <FiThumbsUp size={16} fill={isLiked ? 'currentColor' : 'transparent'} /> {comment.likes}
                  </button>
                  <button
                    className={`comment-action-btn ${isDisliked ? 'disliked' : ''}`}
                    onClick={() => handleDislike(comment.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: isDisliked ? '#ef4444' : 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <FiThumbsDown size={16} fill={isDisliked ? 'currentColor' : 'transparent'} /> {comment.dislikes}
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                    {comment.dislikes >= 1 && 'Near removal'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
