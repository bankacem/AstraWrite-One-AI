
import { WordPressConfig } from '../types';

export const publishToWordPress = async (
  config: WordPressConfig,
  title: string,
  content: string,
  featuredImageUrl?: string,
  overridePostType?: 'posts' | 'pages',
  overrideStatus?: 'draft' | 'publish'
) => {
  if (!config.url || !config.username || !config.applicationPassword) {
    throw new Error('Please configure WordPress settings first.');
  }

  const baseUrl = config.url.replace(/\/$/, '');
  const auth = btoa(`${config.username}:${config.applicationPassword}`);
  const postType = overridePostType || config.defaultPostType || 'posts';
  const status = overrideStatus || config.defaultStatus || 'draft';

  try {
    let finalContent = content;
    if (featuredImageUrl) {
        finalContent = `<img src="${featuredImageUrl}" alt="${title}" class="wp-block-image" />\n\n${content}`;
    }

    const response = await fetch(`${baseUrl}/wp-json/wp/v2/${postType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        title: title,
        content: finalContent,
        status: status,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'WordPress API Error');
    }

    const postData = await response.json();
    return postData.link;
  } catch (error: any) {
    console.error('WordPress Publishing Failed:', error);
    throw error;
  }
};
