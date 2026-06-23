'use client';
import { VIDEOS } from '@/utils/data';
import CinemaPlayer from '@/components/CinemaPlayer';
import CommentSection from '@/components/CommentSection';
import Link from 'next/link';

export default function WatchPage({ params }) {
  const { id } = params;
  const video = VIDEOS.find(v => v.id === id);

  if (!video) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <div className="empty-state-title">Video not found</div>
          <div className="empty-state-desc">The video you're looking for doesn't exist.</div>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const recommended = VIDEOS.filter(v => v.id !== id).slice(0, 8);

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="watch-layout">
        {/* Left: Player + Info + Comments */}
        <div>
          <div className="watch-player-wrap">
            <CinemaPlayer video={video} allVideos={VIDEOS} />
          </div>
          {/* Comment Section */}
          <div style={{ marginTop: 8 }}>
            <CommentSection videoId={video.id} />
          </div>
        </div>

        {/* Right: Recommended */}
        <div>
          <div className="watch-sidebar-title">Up Next</div>
          <div className="comments-panel" style={{ height: 'auto', overflow: 'visible' }}>
            {recommended.map(v => (
              <Link key={v.id} href={`/watch/${v.id}`} className="recommended-item" style={{ display: 'flex' }}>
                <div className="recommended-thumb">
                  <img src={v.thumbnail} alt={v.title} />
                </div>
                <div className="recommended-info">
                  <div className="recommended-title">{v.title}</div>
                  <div className="recommended-meta">{v.channel}</div>
                  <div className="recommended-meta">{v.views} views • {v.duration}</div>
                  {v.tier && v.tier !== 'free' && (
                    <span className={`badge badge-${v.tier}`} style={{ marginTop: 4, fontSize: '0.65rem' }}>
                      {v.tier}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
