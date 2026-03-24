import crypto from 'node:crypto';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

interface TwitterConfig {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  feedbackThreadId: string;
}

function getTwitterConfig(): TwitterConfig | null {
  const consumerKey = process.env.TWITTER_CONSUMER_KEY ?? '';
  const consumerSecret = process.env.TWITTER_CONSUMER_SECRET ?? '';
  const accessToken = process.env.TWITTER_ACCESS_TOKEN ?? '';
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '';
  const feedbackThreadId = process.env.TWITTER_FEEDBACK_THREAD_ID ?? '';

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret || !feedbackThreadId) {
    return null;
  }

  return { consumerKey, consumerSecret, accessToken, accessTokenSecret, feedbackThreadId };
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildOAuthHeader(
  config: TwitterConfig,
  method: string,
  url: string,
  extraParams?: Record<string, string>,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: config.accessToken,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...extraParams };

  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    config.consumerSecret,
    config.accessTokenSecret,
  );

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

// --- Image generation ---

function wrapText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

async function generateFeedbackCard(
  avatarUrl: string | null,
  displayName: string,
  feedbackText: string,
): Promise<Buffer> {
  const width = 1200;
  const height = 628;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background — warm cream gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#FFF8F0');
  gradient.addColorStop(1, '#F3E8D8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle border
  ctx.strokeStyle = 'rgba(145, 118, 90, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Avatar
  const avatarSize = 80;
  const avatarX = 80;
  const avatarY = 80;

  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Avatar border
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(145, 118, 90, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } catch {
      // Draw fallback circle
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(145, 118, 90, 0.15)';
      ctx.fill();
      ctx.fillStyle = '#7a5b44';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName.charAt(0).toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }
  } else {
    // Fallback avatar
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(145, 118, 90, 0.15)';
    ctx.fill();
    ctx.fillStyle = '#7a5b44';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName.charAt(0).toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  }

  // Name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#2f2216';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(displayName, avatarX + avatarSize + 24, avatarY + 8);

  // "pom.voyage/assorted/feedback" label
  ctx.fillStyle = '#9c7a5d';
  ctx.font = '20px sans-serif';
  ctx.fillText('pom.voyage/assorted/feedback', avatarX + avatarSize + 24, avatarY + 50);

  // Feedback text — wrapped
  const textX = 80;
  const textY = 200;
  const maxWidth = width - 160;
  const lineHeight = 38;
  const truncated = wrapText(feedbackText, 200);

  ctx.fillStyle = '#594a3f';
  ctx.font = '26px sans-serif';

  // Simple word-wrap
  const words = truncated.split(' ');
  let line = '';
  let y = textY;
  const maxLines = 8;
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, textX, y);
      line = word;
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line + '...', textX, y);
        line = '';
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, textX, y);
  }

  // Bottom label
  ctx.fillStyle = '#9c7a5d';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Public Feedback', width - 80, height - 40);

  return canvas.toBuffer('image/png');
}

// --- Twitter media upload (v1.1 chunked) ---

async function uploadMedia(config: TwitterConfig, imageBuffer: Buffer): Promise<string | null> {
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

  // INIT
  const initParams: Record<string, string> = {
    command: 'INIT',
    total_bytes: imageBuffer.length.toString(),
    media_type: 'image/png',
  };

  const initAuth = buildOAuthHeader(config, 'POST', uploadUrl, initParams);
  const initBody = new URLSearchParams(initParams);

  const initRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: initAuth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: initBody.toString(),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    console.warn(`Media upload INIT failed (${initRes.status}): ${err}`);
    return null;
  }

  const initData = await initRes.json() as { media_id_string?: string };
  const mediaId = initData.media_id_string;
  if (!mediaId) return null;

  // APPEND
  const boundary = `----boundary${crypto.randomBytes(8).toString('hex')}`;
  const appendParts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="command"\r\n\r\nAPPEND`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="media_id"\r\n\r\n${mediaId}`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="segment_index"\r\n\r\n0`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="media_data"\r\n\r\n${imageBuffer.toString('base64')}`,
    `\r\n--${boundary}--\r\n`,
  ];
  const appendBody = appendParts.join('');

  const appendAuth = buildOAuthHeader(config, 'POST', uploadUrl);
  const appendRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: appendAuth,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: appendBody,
  });

  if (!appendRes.ok) {
    const err = await appendRes.text();
    console.warn(`Media upload APPEND failed (${appendRes.status}): ${err}`);
    return null;
  }

  // FINALIZE
  const finalizeParams: Record<string, string> = {
    command: 'FINALIZE',
    media_id: mediaId,
  };

  const finalizeAuth = buildOAuthHeader(config, 'POST', uploadUrl, finalizeParams);
  const finalizeBody = new URLSearchParams(finalizeParams);

  const finalizeRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: finalizeAuth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: finalizeBody.toString(),
  });

  if (!finalizeRes.ok) {
    const err = await finalizeRes.text();
    console.warn(`Media upload FINALIZE failed (${finalizeRes.status}): ${err}`);
    return null;
  }

  return mediaId;
}

// --- Post tweet ---

interface TweetOptions {
  text: string;
  replyToId?: string;
  mediaId?: string;
}

async function postTweet(config: TwitterConfig, options: TweetOptions): Promise<{ id: string } | null> {
  const url = 'https://api.x.com/2/tweets';
  const authHeader = buildOAuthHeader(config, 'POST', url);

  const body: Record<string, unknown> = { text: options.text };
  if (options.replyToId) {
    body.reply = { in_reply_to_tweet_id: options.replyToId };
  }
  if (options.mediaId) {
    body.media = { media_ids: [options.mediaId] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.warn(`Twitter post failed (${response.status}): ${errorBody}`);
    return null;
  }

  const payload = await response.json() as { data?: { id?: string } };
  return payload.data?.id ? { id: payload.data.id } : null;
}

// --- Public API ---

export interface FeedbackTweetParams {
  username: string | null;
  isAnonymous: boolean;
  feedbackText: string;
  avatarUrl?: string | null;
}

export async function tweetFeedbackLink(params: FeedbackTweetParams): Promise<void> {
  const config = getTwitterConfig();
  if (!config) {
    return;
  }

  const siteUrl = process.env.SITE_URL ?? 'https://pom.voyage';
  const feedbackUrl = `${siteUrl}/assorted/feedback`;

  const displayName = params.isAnonymous
    ? 'Anonymous'
    : params.username
      ? `@${params.username}`
      : 'Someone';

  const text = `New feedback from ${displayName}\n\n${feedbackUrl}`;

  try {
    // Generate card image
    const imageBuffer = await generateFeedbackCard(
      params.avatarUrl ?? null,
      displayName,
      params.feedbackText,
    );

    // Upload image to Twitter
    const mediaId = await uploadMedia(config, imageBuffer);

    // Post tweet with image
    await postTweet(config, {
      text,
      replyToId: config.feedbackThreadId,
      mediaId: mediaId ?? undefined,
    });
  } catch (error) {
    console.warn('Failed to tweet feedback link:', error);
  }
}
