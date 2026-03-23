import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import {
  CRYPTO_CONVERSATIONS,
  CRYPTO_CONVERSATIONS_INTRO,
} from '../data/assorted-content';
import styles from './CryptoConversations.module.css';

export function CryptoConversationsPage() {
  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Crypto conversations
          </div>
          <div>
            <p className="mb-6 text-[0.85rem] leading-[1.7] text-[#777]">{CRYPTO_CONVERSATIONS_INTRO}</p>
            <div className="flex flex-col gap-3">
              {CRYPTO_CONVERSATIONS.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/assorted/crypto-conversations/${conversation.id}`}
                  className={styles.conversationLink}
                >
                  <span className={styles.username}>{conversation.username}</span>
                  <span className={styles.conversationTitle}>{conversation.title}</span>
                  <span className={styles.conversationDate}>{conversation.date}</span>
                  <span className="dir-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
