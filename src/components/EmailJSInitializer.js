'use client';

import { useEffect } from 'react';
import { initializeEmailJS } from '../services/email';

export default function EmailJSInitializer() {
  useEffect(() => {
    initializeEmailJS();
  }, []);

  return null;
}
