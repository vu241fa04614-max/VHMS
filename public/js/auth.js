/**
 * Vignan Hostel Management System
 * Authentication utilities
 */

const Auth = {
  TOKEN_KEY: 'vhms_token',
  USER_KEY: 'vhms_user',

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.USER_KEY));
    } catch { return null; }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  hasRole(...roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  },

  requireAuth(redirectUrl = '/login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  requireRole(roles, redirectUrl = '/login.html') {
    if (!this.requireAuth(redirectUrl)) return false;
    if (!this.hasRole(...(Array.isArray(roles) ? roles : [roles]))) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  redirectToDashboard() {
    const user = this.getUser();
    if (!user) { window.location.href = '/login.html'; return; }
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        window.location.href = '/admin-dashboard.html';
        break;
      case 'warden':
        window.location.href = '/warden-dashboard.html';
        break;
      case 'student':
        window.location.href = '/student-dashboard.html';
        break;
      default:
        window.location.href = '/login.html';
    }
  },

  async logout() {
    try { await api.logout(); } catch {}
    this.clearSession();
    window.location.href = '/';
  }
};

window.Auth = Auth;
