import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { Header } from '../components/Header';
import type { RecommendationEntry } from '../types';

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])javascript:[\s\S]*?\2/gi, ' $1="#"');
}

function renderBody(markdown: string): string {
  return sanitizeHtml(marked.parse(markdown) as string);
}

interface Props {
  recommendations?: RecommendationEntry[];
}

export function RecommendationsPage({ recommendations: ssrData }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>(ssrData ?? []);

  useEffect(() => {
    if (ssrData && ssrData.length > 0) return;
    const config = window.__APP_CONFIG__;
    if (!config?.supabaseUrl || !config?.supabaseAnonKey) return;
    fetch(
      `${config.supabaseUrl}/rest/v1/recommendations?order=sort_order.asc&select=id,name,role_title,emoji,linkedin_url,location,body_markdown,image_url,intro_url,context,status,is_hired,is_freelancer,sort_order,created_at`,
      {
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
      },
    )
      .then((r) => r.json())
      .then((data) => setRecommendations(data))
      .catch(() => {});
  }, [ssrData]);

  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Recommendations
          </div>
          <p className="mb-4 text-[0.8rem] text-[#999] italic">
            Fine individuals I recommend. Context on my relationship with each below. I <a href="https://advisable.notion.site/10-incredible-engineers-operators-and-designers-who-are-available-for-new-opportunities-ea659282b6a34735a0b8775e4ebc9cb2" target="_blank" rel="noopener noreferrer" className="text-[#4a90d9] hover:underline">started doing this</a> after I shut down my company. It resulted in everyone getting job offers, including many who still work at the company today.
          </p>

          {recommendations.length === 0 && (
            <p className="text-[0.85rem] text-[#999]">No recommendations yet.</p>
          )}

          <div className="flex flex-col" style={{ gap: '0.5rem' }}>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  hired: { label: 'Hired', className: 'recommendation-status-hired' },
  taking_clients: { label: 'Taking Clients', className: 'recommendation-status-available' },
  probably_unavailable: { label: 'Probably Unavailable', className: 'recommendation-status-unavailable' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.probably_unavailable;
  return <span className={config.className}>{config.label}</span>;
}

function RecommendationCard({ rec }: { rec: RecommendationEntry }) {
  return (
    <details className="recommendation-card">
      <summary className="recommendation-summary">
        <div className="recommendation-summary-content">
          {rec.image_url && (
            <img
              src={rec.image_url}
              alt={rec.name}
              className="recommendation-thumb"
            />
          )}
          <div className="recommendation-summary-text">
            <div className="flex items-center gap-2">
              {rec.emoji && <span className="text-base">{rec.emoji}</span>}
              <span className="text-[0.95rem] font-semibold text-[#333]">{rec.name}</span>
              {rec.linkedin_url && (
                <a
                  href={rec.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] text-[#4a90d9] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  LinkedIn
                </a>
              )}
              {rec.location && (
                <>
                  <span className="text-[#ccc]">|</span>
                  <span className="text-[0.75rem] text-[#999]">{rec.location}</span>
                </>
              )}
            </div>
            <div className="mt-0.5 text-[0.8rem] text-[#666]">{rec.role_title}</div>
          </div>
          <StatusBadge status={rec.status} />
        </div>
      </summary>
      <div className="recommendation-expanded">
        <div className="recommendation-body text-[0.82rem] leading-[1.7] text-[#666]">
          {rec.image_url && (
            <img
              src={rec.image_url}
              alt={rec.name}
              className="recommendation-image"
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: renderBody(rec.body_markdown) }} />
        </div>
        {rec.context && (
          <div className="recommendation-context">
            <span className="recommendation-context-label">Context:</span> {rec.context}
          </div>
        )}
      </div>
    </details>
  );
}
