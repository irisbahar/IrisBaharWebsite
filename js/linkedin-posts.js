/**
 * Loads and displays LinkedIn posts from JSON file
 */
async function loadLinkedInPosts() {
  try {
    const response = await fetch('./data/linkedin-posts.json');
    const postIds = await response.json();

    const container = document.getElementById('linkedin-posts-container');

    if (!container) {
      console.error('LinkedIn posts container not found');
      return;
    }

    container.innerHTML = '';

    postIds.forEach(postId => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.linkedin.com/embed/feed/update/urn:li:share:${postId}`;
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      iframe.title = 'Embedded post';
      iframe.className = 'linkedin-post-iframe';

      container.appendChild(iframe);
    });
  } catch (error) {
    console.error('Error loading LinkedIn posts:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadLinkedInPosts);
