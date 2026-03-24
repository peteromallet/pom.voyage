import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';
import { Header } from '../components/Header';
import { getClientPosts } from '../lib/client-posts';

interface PostsPageProps {
  posts?: PostSummary[];
}

const COLOR_VARIANTS = [
  'color-1',
  'color-2',
  'color-3',
  'color-4',
  'color-5',
  'color-6',
  'color-7',
  'color-8',
];

let cachedPosts: PostSummary[] | null = null;

export function PostsPage({ posts: initialPosts }: PostsPageProps) {
  const hasCached = !initialPosts?.length && cachedPosts !== null;
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts ?? cachedPosts ?? []);
  const [loading, setLoading] = useState(!initialPosts?.length && !hasCached);

  useEffect(() => {
    if (initialPosts?.length) return;
    if (cachedPosts !== null) {
      setPosts(cachedPosts);
      setLoading(false);
      return;
    }

    getClientPosts()
      .then((result) => {
        if (result) {
          cachedPosts = result;
          setPosts(result);
        }
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [initialPosts]);

  return (
    <div className="container">
      <Header activeTab="posts" />
      <div id="posts-section" className="content-section">
        <div className="posts-section-content mx-auto mt-8 max-w-[1200px] px-4 pb-16">
          <div className="posts-list loading-element flex flex-col gap-8">
            {posts.length === 0 && !loading ? (
              <div className="p-8 text-center italic text-[#9ca3af]"><p>No posts yet.</p></div>
            ) : (
              posts.map((post, index) => (
                <Link key={post.slug} to={`/posts/${post.slug}`} className="posts-card-link">
                  <div className={`posts-card ${COLOR_VARIANTS[index % COLOR_VARIANTS.length]}`}>
                    <h3>{post.title}</h3>
                    <p className="posts-card-date">{post.formattedDate}</p>
                    <p className="posts-card-excerpt">{post.excerpt}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
