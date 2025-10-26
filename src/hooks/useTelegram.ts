import WebApp from '@twa-dev/sdk';
import { useCallback } from 'react';

export const useTelegram = () => {
  const tg = WebApp;

  const onClose = () => {
    tg.close();
  };

  const onToggleButton = () => {
    if (tg.MainButton.isVisible) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
    }
  };

  const shareApp = () => {
    tg.switchInlineQuery('Check out this cool animation app!');
  };

  const isCloudStorageSupported = tg.isVersionAtLeast('6.1');

  const saveData = useCallback((data: object) => {
    if (isCloudStorageSupported) {
      tg.CloudStorage.setItem('preset', JSON.stringify(data), (err) => {
        if (err) {
          // If cloud storage fails (e.g., due to network), fall back to local storage
          localStorage.setItem('preset', JSON.stringify(data));
        }
      });
    } else {
      // If version is not supported, use local storage directly
      localStorage.setItem('preset', JSON.stringify(data));
    }
  }, [isCloudStorageSupported, tg.CloudStorage]);

  const readData = useCallback((): Promise<object | null> => {
    return new Promise((resolve) => {
      if (isCloudStorageSupported) {
        tg.CloudStorage.getItem('preset', (err, value) => {
          if (err || !value) {
            // If cloud storage is empty or fails, try reading from local storage as a fallback
            const localValue = localStorage.getItem('preset');
            resolve(localValue ? JSON.parse(localValue) : null);
          } else {
            resolve(JSON.parse(value as string));
          }
        });
      } else {
        // If version is not supported, read from local storage directly
        const localValue = localStorage.getItem('preset');
        resolve(localValue ? JSON.parse(localValue) : null);
      }
    });
  }, [isCloudStorageSupported, tg.CloudStorage]);

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  }, [tg.HapticFeedback]);

  return {
    onClose,
    onToggleButton,
    shareApp,
    saveData,
    readData,
    triggerHapticFeedback,
    tg,
    user: tg.initDataUnsafe?.user,
    queryId: tg.initDataUnsafe?.query_id,
  };
};