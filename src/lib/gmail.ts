// Gmail API integration for Dromeas OS
// Fetches emails directly without needing n8n

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: { mimeType: string; body?: { data?: string } }[];
  };
  internalDate: string;
}

interface ParsedEmail {
  message_id: string;
  thread_id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  snippet: string;
  received_at: string;
}

// Parse Gmail message into our format
function parseGmailMessage(message: GmailMessage): ParsedEmail {
  const headers = message.payload.headers;
  const getHeader = (name: string) =>
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Get body content
  let body = '';
  if (message.payload.body?.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  } else if (message.payload.parts) {
    const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }

  return {
    message_id: message.id,
    thread_id: message.threadId,
    sender: getHeader('From'),
    recipient: getHeader('To'),
    subject: getHeader('Subject'),
    body: body.substring(0, 10000), // Limit body size
    snippet: message.snippet,
    received_at: new Date(parseInt(message.internalDate)).toISOString(),
  };
}

// Fetch emails from Gmail using OAuth token
export async function fetchGmailEmails(
  accessToken: string,
  maxResults: number = 20,
  query: string = 'is:inbox'
): Promise<ParsedEmail[]> {
  const baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me';

  // Get message list
  const listResponse = await fetch(
    `${baseUrl}/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!listResponse.ok) {
    throw new Error(`Gmail API error: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  const messages = listData.messages || [];

  // Fetch full message details
  const emails: ParsedEmail[] = [];
  for (const msg of messages) {
    const msgResponse = await fetch(
      `${baseUrl}/messages/${msg.id}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (msgResponse.ok) {
      const fullMessage = await msgResponse.json();
      emails.push(parseGmailMessage(fullMessage));
    }
  }

  return emails;
}

// Refresh access token using refresh token
export async function refreshGmailToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}
