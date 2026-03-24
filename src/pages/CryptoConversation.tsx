import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CONVERSATION_DETAILS } from '../data/assorted-content';

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
          <div className="chat-page">
            <div className="chat-header">
              <div className="chat-header-participants">
                {[me, other].map((participant, index) => (
                  <div key={participant.handle} className="contents">
                    {index === 1 ? <span className="chat-header-separator">&amp;</span> : null}
                    <a href={participant.href} target="_blank" rel="noreferrer" className="chat-header-participant">
                      <div className="chat-header-avatar">{participant.avatar}</div>
                      <div className="chat-header-info">
                        <span className="chat-header-name">{participant.name}</span>
                        <span className="chat-header-handle">{participant.handle}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              <div className="chat-header-meta">
                <span className="chat-header-platform">X (DM)</span>
                <span className="chat-header-date">{detail.summaryDate}</span>
              </div>
            </div>
            <p className="chat-context">{detail.context}</p>
            <div className="chat-thread">
              {detail.messages.map((message, index) => (
                <div
                  key={`${message.handle}-${index}`}
                  className={`chat-message ${message.speaker === 'me' ? 'chat-message-me' : 'chat-message-other'}`}
                >
                  <a href={message.href} target="_blank" rel="noreferrer" className="chat-msg-avatar-link">
                    <div className="chat-msg-avatar">{message.avatar}</div>
                  </a>
                  <div className="chat-msg-content">
                    <span className="chat-msg-sender">{message.name}</span>
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
