const CONFIG = {
  // Base URL for the NovaCV web app.
  // Change this to your custom domain when moving away from Vercel (e.g., 'https://yourdomain.com')
  BASE_URL: 'https://novacv-web.vercel.app',
  // BASE_URL: 'http://localhost:3000',

  get API_URL_BASE() {
    return `${this.BASE_URL}/api/extension`;
  },

  get LOGIN_URL() {
    return `${this.BASE_URL}/login`;
  }
};
