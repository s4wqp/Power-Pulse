import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import BrandLogo from '../../assets/images/Power_Pulse.png';
import styles from './Auth.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', true);
      return;
    }

    const success = await login(email, password);
    if (success) {
      const { user } = useAuthStore.getState();
      if (user?.role === 'Trainee') navigate('/trainee/home', { replace: true });
      else if (user?.role === 'Trainer') navigate('/trainer/home', { replace: true });
      else if (user?.role === 'Admin') navigate('/admin/home', { replace: true });
      else navigate('/trainee/home', { replace: true });
    } else {
      showToast(useAuthStore.getState().error || 'Login failed', true);
    }
  };

  return (
    <div className={styles.authLayout}>
      {/* Decorative Left Panel */}
      <div className={styles.decorativePanel}>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon1}`}>fitness_center</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon2}`}>monitor_heart</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon3}`}>sports_gymnastics</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon4}`}>sports_martial_arts</span>
        <img src={BrandLogo} alt="Power Pulse" className={styles.brandLogo} />
        <p className={styles.brandTagline}>Unleash Your Potential</p>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

          <div className={styles.headerArea}>
            <h1 className={styles.heading}>
              Welcome <span className={styles.headingGradient}>Back</span>
            </h1>
            <p className={styles.subtitle}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.linkText}>Register here!</Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className={styles.formArea}>
            <TextField
              label="Email"
              placeholder="Enter your email address"
              icon="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dark
            />

            <div className={styles.spacer}></div>

            <TextField
              label="Password"
              placeholder="Enter your Password"
              type="password"
              icon="lock_outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dark
            />

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.linkTextSmall}>
                Forgot Password?
              </Link>
            </div>

            <div className={styles.submitArea}>
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className={styles.loginBtn}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
