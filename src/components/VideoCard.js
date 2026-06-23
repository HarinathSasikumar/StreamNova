'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

const TIER_LABELS = { free: null, bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };
const TIER_COLORS = { bronze: 'badge-bronze', silver: 'badge-silver', gold: 'badge-gold' };

export default function VideoCard({ video }) {
  const { addDownload, canDownload, user, addToast } = useApp();

  function handleDownload(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast({ type: 'warning', title: 'Sign in required', message: 'Please sign in to download videos.' });
      return;
    }
    if (!canDownload(user?.plan)) {
      addToast({ type: 'error', title: 'Download limit reached', message: 'Upgrade your plan for more downloads.' });
      return;
    }
    addDownload(video);
    addToast({ type: 'success', title: 'Downloaded!', message: `"${video.title}" saved to your Downloads Hub.` });
  }

  return (
    <Link href={`/watch/${video.id}`} className="video-card" style={{ display: 'block' }}>
      <div className="video-card-thumb">
        <img src={video.thumbnail} alt={video.title} loading="lazy" />
        <div className="video-card-overlay">
          <div className="video-card-play"></div>
        </div>
        <span className="video-card-duration">{video.duration}</span>
        {video.tier && video.tier !== 'free' && (
          <div className="video-card-tier">
            <span className={`badge ${TIER_COLORS[video.tier]}`}>{TIER_LABELS[video.tier]}</span>
          </div>
        )}
      </div>

      <div className="video-card-body">
        <div className="video-card-channel">
          <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>{video.channelAvatar}</div>
          <span className="video-card-channel-name">{video.channel}</span>
          <span className={`badge badge-free`} style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{video.category}</span>
        </div>
        <div className="video-card-title" style={{ marginTop: 8 }}>{video.title}</div>
        <div className="video-card-meta">
          <span>{video.views}</span>
          <span>•</span>
          <span>{video.timestamp}</span>
          <button
            onClick={handleDownload}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
            title="Download"
          >
            Download
          </button>
        </div>
      </div>
    </Link>
  );
}
