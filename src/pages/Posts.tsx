import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';
import { Header } from '../components/Header';
import { getClientPosts } from '../lib/client-posts';
import styles from './Posts.module.css';

interface PostsPageProps {
  posts?: PostSummary[];
}

const COLOR_VARIANTS = [
  styles.color1,
  styles.color2,
  styles.color3,
  styles.color4,
  styles.color5,
  styles.color6,
  styles.color7,
  styles.color8,
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
        <div className={`mx-auto mt-8 pb-16 max-w-[1200px] px-4 ${styles.postsSectionContent}`}>
          <div className={`loading-element flex flex-col gap-8 ${styles.postsList}`}>
            {posts.length === 0 && !loading ? (
              <div className="p-8 text-center italic text-[#9ca3af]"><p>No posts yet.</p></div>
            ) : (
              posts.map((post, index) => (
                <Link key={post.slug} to={`/posts/${post.slug}`} className={styles.postCardLink}>
                  <div className={`${styles.postCard} ${COLOR_VARIANTS[index % COLOR_VARIANTS.length]}`}>
                    <h3>{post.title}</h3>
                    <p className={styles.postDate}>{post.formattedDate}</p>
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
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
