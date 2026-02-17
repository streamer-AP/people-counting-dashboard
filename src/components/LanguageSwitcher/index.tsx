import React from 'react';
import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <Button
      type="text"
      icon={<GlobalOutlined />}
      onClick={toggleLanguage}
      style={{ color: 'white' }}
    >
      {i18n.language === 'en' ? '中文' : 'EN'}
    </Button>
  );
};

export default LanguageSwitcher;
