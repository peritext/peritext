// translationRunner.js
import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
  messagesDirectory: 'translations/extractedMessages',
  translationsDirectory: 'translations/locales/',
  languages: ['fr', 'en']
});
