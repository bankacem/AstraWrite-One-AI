
import { WordPressConfig } from '../types';

const API_BASE_URL = process.env.VITE_API_BASE_URL;

export const publishToWordPress = async (
  config: WordPressConfig,
  title: string,
  content: string,
  imageUrl?: string,
  status: 'draft' | 'publish' = 'draft'
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/wordpress/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, status, imageUrl, config }),
  });
  if (!response.ok) {
    throw new Error('Failed to post to WordPress');
  }
  const data = await response.json();
  return data.link;
};
