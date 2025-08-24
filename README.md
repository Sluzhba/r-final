# 🚀 Демонстрація мемоізації в React

Цей проект демонструє різні типи мемоізації в React: `useMemo`, `useCallback` та `React.memo`. Включає в себе практичні приклади, порівняння продуктивності та найкращі практики оптимізації React-додатків.

## 📋 Огляд проекту

Проект містить чотири основні демонстрації:

1. **🎯 Базова демонстрація** - Основи мемоізації з простими прикладами
2. **💼 Практичне застосування** - Реальний сценарій з пошуком та фільтрацією користувачів
3. **⚡ Порівняння продуктивності** - Демонстрація впливу мемоізації на швидкодію
4. **🏆 Найкращі практики** - Комплексний приклад каталогу товарів з усіма видами оптимізації

## 🛠️ Технології

- **React 18** з TypeScript
- **Vite** для збірки та розробки
- **CSS3** для стилізації
- Хуки React: `useState`, `useMemo`, `useCallback`, `useEffect`
- **React.memo** для мемоізації компонентів

## 🚀 Запуск проекту

```bash
# Встановлення залежностей
npm install

# Запуск development server
npm run dev

# Збірка для продакшену
npm run build
```

Проект буде доступний за адресою: `http://localhost:5173/`

## 📁 Структура проекту

```
src/
├── components/
│   ├── MemoizationDashboard.tsx    # Головний компонент з навігацією
│   ├── MemoDemo.tsx                # Базова демонстрація мемоізації
│   ├── PracticalMemoDemo.tsx       # Практичне застосування
│   ├── PerformanceComparison.tsx   # Порівняння продуктивності
│   └── BestPracticesDemo.tsx       # Найкращі практики
├── App.tsx                         # Головний компонент додатку
├── App.css                         # Стилі додатку
└── main.tsx                        # Точка входу
```

## 🎓 Що демонструє кожен компонент

### 🎯 Базова демонстрація (MemoDemo)
- Порівняння компонентів З та БЕЗ мемоізації
- Використання `useMemo` для складних обчислень
- Застосування `useCallback` для мемоізації функцій
- Демонстрація `React.memo` для оптимізації дочірніх компонентів

### 💼 Практичне застосування (PracticalMemoDemo)
- Система фільтрації користувачів
- Мемоізація списків та статистики
- Оптимізація пошуку та сортування
- Реальний приклад використання в додатку

### ⚡ Порівняння продуктивності (PerformanceComparison)
- Прямо порівняння З та БЕЗ мемоізації
- Вимірювання часу виконання обчислень
- Демонстрація впливу на ререндери компонентів
- Візуальне представлення різниці у продуктивності

### 🏆 Найкращі практики (BestPracticesDemo)
- Комплексний каталог товарів
- Множинна мемоізація з різними залежностями
- Оптимізація складних взаємодій користувача
- Приклад реального застосування всіх техніок

## 📊 Ключові концепції

### `useMemo`
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]); // Перераховується тільки при зміні data
```

**Використовуйте для:**
- Складних обчислень
- Фільтрації та сортування великих масивів
- Створення об'єктів та масивів
- Обчислення статистики

### `useCallback`
```typescript
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]); // Створюється нова функція тільки при зміні value
```

**Використовуйте для:**
- Функцій, що передаються до дочірніх компонентів
- Event handlers у оптимізованих компонентах
- Залежностей в інших хуках

### `React.memo`
```typescript
const MyComponent = memo(({ prop1, prop2 }) => {
  return <div>{prop1} {prop2}</div>;
}); // Ререндер тільки при зміні пропів
```

**Використовуйте для:**
- Компонентів, що рендерять складні списки
- Дочірніх компонентів з дорогими обчисленнями
- Компонентів, що рідко змінюються

## 🔍 Як досліджувати

1. **Відкрийте DevTools Console (F12)** - всі демонстрації виводять логи
2. **Експериментуйте з фільтрами** - змінюйте параметри та спостерігайте за логами
3. **Натискайте кнопки ререндеру** - порівнюйте поведінку мемоізованих та звичайних компонентів
4. **Змінюйте розмір даних** - спостерігайте за впливом на продуктивність

## ⚠️ Важливі нюанси

### Коли НЕ використовувати мемоізацію:
- Для простих обчислень (додавання, віднімання)
- У компонентах, що рідко рендеряться
- Коли залежності змінюються при кожному рендері
- Для примітивних значень у пропах

### Поширені помилки:
- Неправильні залежності в масиві
- Мемоізація всього підряд без потреби
- Ігнорування використання пам'яті
- Передача нових об'єктів як залежності

## 🎯 Корисні поради

1. **Профілюйте перед оптимізацією** - переконайтеся, що проблема справді існує
2. **Використовуйте React Developer Tools** - для аналізу ререндерів
3. **Вимірюйте продуктивність** - користуйтеся Performance API
4. **Не передоптимізуйте** - мемоізація має свої витрати

## 📚 Додаткові ресурси

- [React Documentation - useMemo](https://react.dev/reference/react/useMemo)
- [React Documentation - useCallback](https://react.dev/reference/react/useCallback)
- [React Documentation - memo](https://react.dev/reference/react/memo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

## 🤝 Внесок

Вітаються пропозиції покращень та додаткових прикладів мемоізації!

### Button
Універсальний компонент кнопки з різними варіантами стилів.

```tsx
import { Button } from './components';

<Button 
  variant="primary" 
  size="lg"
  loading={false}
  onClick={() => {}}
>
  Click me
</Button>
```

### Card
Компонент картки для відображення контенту з підтримкою дій.

```tsx
import { Card, CardActions, CardButton } from './components';

<Card
  title="Card Title"
  subtitle="Card Subtitle"
  content="Card content"
  imageUrl="path/to/image.jpg"
  variant="elevated"
  actions={
    <CardActions>
      <CardButton variant="primary">Action</CardButton>
    </CardActions>
  }
/>
```

### Form
Динамічний компонент форми з валідацією.

```tsx
import { Form } from './components';

const fields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true
  }
];

<Form
  title="Contact Form"
  fields={fields}
  onSubmit={(data) => console.log(data)}
/>
```

### Modal
Модальне вікно з підтримкою різних розмірів.

```tsx
import { Modal, ModalFooter } from './components';

<Modal
  isOpen={true}
  onClose={() => {}}
  title="Modal Title"
  size="md"
>
  Modal content
  <ModalFooter>
    <Button>Close</Button>
  </ModalFooter>
</Modal>
```

### Input
Компонент поля вводу з підтримкою іконок та валідації.

```tsx
import { Input } from './components';

<Input
  label="Search"
  placeholder="Type here..."
  icon={<SearchIcon />}
  error="Error message"
  required
/>
```

### Grid & Layout
Система сітки та макета для організації контенту.

```tsx
import { Layout, Grid, GridItem } from './components';

<Layout maxWidth="xl">
  <Grid cols={3} gap="lg" responsive={{ sm: 1, md: 2 }}>
    <GridItem colSpan={2}>Content</GridItem>
    <GridItem>Sidebar</GridItem>
  </Grid>
</Layout>
```

### Alert
Компонент для відображення повідомлень.

```tsx
import { Alert } from './components';

<Alert 
  variant="success" 
  title="Success"
  closable
  onClose={() => {}}
>
  Operation completed successfully!
</Alert>
```

### Badge
Компонент для відображення значків.

```tsx
import { Badge } from './components';

<Badge 
  variant="primary" 
  size="md"
  removable
  onRemove={() => {}}
>
  New
</Badge>
```

### Loading
Індикатор завантаження з підтримкою повноекранного режиму.

```tsx
import { Loading } from './components';

<Loading 
  size="lg" 
  color="blue"
  text="Loading..."
  fullScreen
/>
```

## Запуск проекту

```bash
# Встановлення залежностей
npm install

# Запуск сервера розробки
npm run dev

# Збірка для продакшену
npm run build
```

## Особливості

- ✅ Повністю адаптивний дизайн
- ✅ TypeScript підтримка
- ✅ Tailwind CSS стилізація
- ✅ Доступність (a11y)
- ✅ Темна тема готова
- ✅ Підтримка SSR
- ✅ Оптимізована продуктивність

## Автор

Створено з ❤️ для сучасної веб-розробки
