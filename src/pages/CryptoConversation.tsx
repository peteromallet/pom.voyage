import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CONVERSATION_DETAILS } from '../data/assorted-content';
import styles from './CryptoConversations.module.css';

interface CryptoConversationPageProps {
  conversationId?: string;
}

export function CryptoConversationPage({ conversationId }: CryptoConversationPageProps) {
  const params = useParams<{ id: string }>();
  const detail = CONVERSATION_DETAILS[params.id ?? conversationId ?? ''];

  if (!detail) {
    return null;
  }

  const [me, other] = detail.participants;

  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> /{' '}
            <a href="/assorted/crypto-conversations">Crypto conversations</a> / {detail.title}
          </div>
          <div className={styles.chatPage}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderParticipants}>
                {[me, other].map((participant, index) => (
                  <div key={participant.handle} className="contents">
                    {index === 1 ? <span className={styles.chatHeaderSeparator}>&amp;</span> : null}
                    <a href={participant.href} target="_blank" rel="noreferrer" className={styles.chatHeaderParticipant}>
                      <div className={styles.chatHeaderAvatar}>{participant.avatar}</div>
                      <div className={styles.chatHeaderInfo}>
                        <span className={styles.chatHeaderName}>{participant.name}</span>
                        <span className={styles.chatHeaderHandle}>{participant.handle}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              <div className={styles.chatHeaderMeta}>
                <span className={styles.chatHeaderPlatform}>X (DM)</span>
                <span className={styles.chatHeaderDate}>{detail.summaryDate}</span>
              </div>
            </div>
            <p className={styles.chatContext}>{detail.context}</p>
            <div className={styles.chatThread}>
              {detail.messages.map((message, index) => (
                <div
                  key={`${message.handle}-${index}`}
                  className={`${styles.chatMessage} ${message.speaker === 'me' ? styles.chatMessageMe : styles.chatMessageOther}`}
                >
                  <a href={message.href} target="_blank" rel="noreferrer" className={styles.chatMsgAvatarLink}>
                    <div className={styles.chatMsgAvatar}>{message.avatar}</div>
                  </a>
                  <div className={styles.chatMsgContent}>
                    <span className={styles.chatMsgSender}>{message.name}</span>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
