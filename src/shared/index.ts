// Shared types
export * from './types';

// Shared UI components
export { default as Navbar } from './ui/Navbar';
export { default as ToastContainer } from './ui/ToastContainer';

// Shared utilities
export { useTranslation } from './lib/useTranslation';
export { ToastProvider, useToast } from './lib/ToastContext';
export * from './lib/mockData';
export * from './lib/departmentHierarchy';

// Shared assets - удаляем проблемный импорт
// export { default as reactLogo } from './assets/react.svg';
