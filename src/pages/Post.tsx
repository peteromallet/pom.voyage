import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { getClientPostPage } from '../lib/client-posts';
import type { PostPageData } from '../types';
import styles from './Post.module.css';

interface PostPageProps {
  data?: PostPageData;
}

export function PostPage({ data: initialData }: PostPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PostPageData | null>(initialData?.post ? initialData : null);
  const [loading, setLoading] = useState(!initialData?.post);

  useEffect(() => {
    if (initialData?.post) return;
    if (!slug) return;

    getClientPostPage(slug)
      .then((result) => {
        if (result) setData(result);
      })
      .catch(() => {
        setData({ post: null, prevPost: null, nextPost: null });
      })
      .finally(() => setLoading(false));
  }, [slug, initialData]);

  if (loading || !data?.post) {
    return (
      <div className="container">
        <Header activeTab="posts" />
        <div className="content-section"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header activeTab="posts" />
      <div id="posts-post-section" className="content-section">
        <article className={`loading-element mx-auto max-w-[800px] px-4 ${styles.postArticle}`}>
          <header className={styles.postHeader}>
            <h1 className={styles.postTitle}>{data.post.title}</h1>
            <p className={styles.postDate}>{data.post.formattedDate}</p>
          </header>

          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: data.post.html }} />

          <nav className={styles.postNavigation}>
            {data.prevPost ? (
              <Link to={`/posts/${data.prevPost.slug}`} className={`${styles.navLink} ${styles.navPrev}`}>
                <span className={styles.navArrow}>←</span>
                <span className={styles.navTitle}>{data.prevPost.title}</span>
              </Link>
            ) : (
              <div className={styles.navSpacer}></div>
            )}

            {data.nextPost ? (
              <Link to={`/posts/${data.nextPost.slug}`} className={`${styles.navLink} ${styles.navNext}`}>
                <span className={styles.navTitle}>{data.nextPost.title}</span>
                <span className={styles.navArrow}>→</span>
              </Link>
            ) : (
              <div className={styles.navSpacer}></div>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
