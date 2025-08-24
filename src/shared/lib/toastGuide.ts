// Руководство по использованию системы уведомлений

// 1. Импорт хука
import { useToast } from './ToastContext';

// 2. Получение функции showToast в компоненте
const { showToast } = useToast();

// 3. Примеры использования:

// Успешное уведомление
showToast({
  type: 'success',
  title: 'Операція виконана',
  message: 'Дані успішно збережені'
});

// Помилка
showToast({
  type: 'error',
  title: 'Помилка',
  message: 'Не вдалося виконати операцію'
});

// Попередження
showToast({
  type: 'warning',
  title: 'Увага',
  message: 'Заповніть всі обов\'язкові поля'
});

// Інформація
showToast({
  type: 'info',
  title: 'Інформація',
  message: 'Дані оновлені автоматично'
});

// Настройка часу показу (опціонально)
showToast({
  type: 'success',
  title: 'Швидке сповіщення',
  duration: 2000 // 2 секунди замість 4 за замовчуванням
});

// Тільки заголовок без опису
showToast({
  type: 'success',
  title: 'Готово!'
});
