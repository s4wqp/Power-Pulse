import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashPage.module.css';
import logo from '../../assets/images/Power_Pulse.png';
import useAuthStore from '../../stores/authStore';

const SplashPage = () => {
  const navigate = useNavigate();
  const { user, tryAutoLogin } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isLoggedIn = tryAutoLogin();
      if (isLoggedIn && user) {
        if (user.role === 'Trainee') navigate('/trainee/home', { replace: true });
        else if (user.role === 'Trainer') navigate('/trainer/home', { replace: true });
        else if (user.role === 'Admin') navigate('/admin/home', { replace: true });
        else navigate('/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 3000); // 3 second splash

    return () => clearTimeout(timer);
  }, [navigate, tryAutoLogin, user]);

  return (
    <div className={styles.container}>
      <img src={logo} alt="Power Pulse Logo" className={styles.logo} />
    </div>
  );
};

export default SplashPage;
