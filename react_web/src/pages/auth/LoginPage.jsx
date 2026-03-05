import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
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
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

        <div className={styles.headerArea}>
          {Typography.mainText('Sign in')}
          <p className={styles.subtitle}>
            If you don't have an account register<br />
            You can{' '}
            <Link to="/register" className={styles.linkText}>Register here !</Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.formArea}>
          <TextField
            label="Email"
            placeholder="Enter your email address"
            icon="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className={styles.spacer}></div>

          <TextField
            label="Password"
            placeholder="Enter your Password"
            type="password"
            icon="lock_outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              Forgot Password
            </Link>
          </div>

          <div className={styles.submitArea}>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className={styles.loginBtn}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
