/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Replace placeholders in the HTML template
  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html
        .replace('%PUBLIC_APP_URL%', import.meta.env.PUBLIC_APP_URL || 'https://dryad-restoration.vercel.app')
        .replace('%PUBLIC_APP_NAME%', import.meta.env.PUBLIC_APP_NAME || 'Dryad Restoration');
    }
  });
} 