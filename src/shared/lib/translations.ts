export const translations = {
  // Общие
  loading: 'Завантаження...',
  error: 'Помилка',
  success: 'Успішно',
  save: 'Зберегти',
  cancel: 'Скасувати',
  delete: 'Видалити',
  edit: 'Редагувати',
  add: 'Додати',
  back: 'Назад',
  next: 'Далі',
  search: 'Пошук',
  filter: 'Фільтр',
  all: 'Всі',
  yes: 'Так',
  no: 'Ні',
  
  // Авторизация
  auth: {
    login: 'Вхід в систему',
    logout: 'Вихід',
    email: 'Електронна пошта',
    password: 'Пароль',
    loginButton: 'Увійти',
    loginError: 'Помилка входу',
    userNotFound: 'Користувача не знайдено',
    wrongPassword: 'Невірний пароль',
    notAuthorized: 'Не авторизований',
    systemTitle: 'Система управління чергуваннями',
    demoAccounts: 'Демо акаунти',
    enterEmail: 'Введіть email',
    enterPassword: 'Введіть пароль',
  },
  
  // Роли
  roles: {
    admin: 'Адміністратор',
    manager: 'Менеджер',
    dutyOfficer: 'Черговий',
    employee: 'Співробітник',
  },
  
  // Навигация
  nav: {
    dashboard: 'Дашборд',
    currentDuty: 'Поточні чергові',
    calendar: 'Календар чергувань',
    scheduleEdit: 'Редагування графіків',
    adminSchedules: 'Графіки',
    users: 'Користувачі',
    departments: 'Підрозділи',
  },
  
  // Dashboard
  dashboard: {
    title: 'Дашборд',
    today: 'Сьогодні',
    totalDepartments: 'Всього підрозділів',
    activeDutyOfficers: 'Активних чергових',
    totalSchedules: 'Всього графіків',
    currentDutyOfficers: 'Поточні чергові',
    noDutyOfficers: 'Немає чергових на сьогодні',
    departmentStatistics: 'Статистика підрозділів',
    loading: 'Завантаження даних...',
    loadError: 'Помилка завантаження',
    loadErrorMessage: 'Не вдалося завантажити список поточних чергових',
  },
  
  // Current Duty Page
  currentDuty: {
    title: 'Поточні чергові',
    subtitle: 'Список співробітників, які зараз чергують',
    filterByDepartment: 'Фільтр за підрозділом',
    allDepartments: 'Всі підрозділи',
    refreshData: 'Оновити дані',
    lastUpdated: 'Останнє оновлення',
    noDutyToday: 'Сьогодні немає чергових',
    dutySchedule: 'Графік чергувань',
    contact: 'Контакт',
    department: 'Підрозділ',
    position: 'Посада',
    dutyPeriod: 'Період чергування',
    phone: 'Телефон',
    loadError: 'Помилка завантаження',
    loadErrorMessage: 'Не вдалося завантажити список поточних чергових',
  },
  
  // Calendar Page
  calendar: {
    title: 'Календар чергувань',
    subtitle: 'Перегляд графіку чергувань',
    selectDepartment: 'Оберіть підрозділ',
    prevMonth: 'Попередній місяць',
    nextMonth: 'Наступний місяць',
    today: 'Сьогодні',
    noDutyAssigned: 'Чергові не призначені',
    dutyOfficer: 'Черговий',
    loadError: 'Помилка завантаження календаря',
  },
  
  // Schedule Edit Page
  scheduleEdit: {
    title: 'Редагування графіків',
    subtitle: 'Створення та редагування графіків чергувань',
    createSchedule: 'Створити графік',
    editSchedule: 'Редагувати графік',
    scheduleName: 'Назва графіку',
    selectDepartment: 'Оберіть підрозділ',
    scheduleType: 'Тип графіку',
    startDate: 'Дата початку',
    endDate: 'Дата закінчення',
    description: 'Опис',
    saveSchedule: 'Зберегти графік',
    deleteSchedule: 'Видалити графік',
    confirmDelete: 'Ви впевнені, що хочете видалити цей графік?',
    scheduleCreated: 'Графік створено',
    scheduleUpdated: 'Графік оновлено',
    scheduleDeleted: 'Графік видалено',
    createError: 'Помилка створення графіку',
    updateError: 'Помилка оновлення графіку',
    deleteError: 'Помилка видалення графіку',
    noSchedules: 'Графіки не знайдені',
    loadError: 'Помилка завантаження графіків',
  },
  
  // Users Page
  users: {
    title: 'Користувачі',
    subtitle: 'Управління користувачами системи',
    addUser: 'Додати користувача',
    editUser: 'Редагувати користувача',
    deleteUser: 'Видалити користувача',
    name: 'Ім\'я',
    email: 'Email',
    position: 'Посада',
    department: 'Підрозділ',
    role: 'Роль',
    actions: 'Дії',
    confirmDelete: 'Ви впевнені, що хочете видалити цього користувача?',
    userCreated: 'Користувача створено',
    userUpdated: 'Користувача оновлено',
    userDeleted: 'Користувача видалено',
    createError: 'Помилка створення користувача',
    updateError: 'Помилка оновлення користувача',
    deleteError: 'Помилка видалення користувача',
    selectDepartment: 'Оберіть підрозділ',
    selectRole: 'Оберіть роль',
    enterName: 'Введіть ім\'я',
    enterEmail: 'Введіть email',
    enterPosition: 'Введіть посаду',
    noUsers: 'Користувачі не знайдені',
    organizationStructure: 'Організаційна структура',
  },
  
  // Departments Page
  departments: {
    title: 'Підрозділи',
    subtitle: 'Управління підрозділами організації',
    addDepartment: 'Додати підрозділ',
    editDepartment: 'Редагувати підрозділ',
    deleteDepartment: 'Видалити підрозділ',
    departmentName: 'Назва підрозділу',
    parentDepartment: 'Батьківський підрозділ',
    manager: 'Керівник',
    level: 'Рівень',
    employeeCount: 'Кількість співробітників',
    actions: 'Дії',
    confirmDelete: 'Ви впевнені, що хочете видалити цей підрозділ?',
    departmentCreated: 'Підрозділ створено',
    departmentUpdated: 'Підрозділ оновлено',
    departmentDeleted: 'Підрозділ видалено',
    createError: 'Помилка створення підрозділу',
    updateError: 'Помилка оновлення підрозділу',
    deleteError: 'Помилка видалення підрозділу',
    selectParent: 'Оберіть батьківський підрозділ',
    selectManager: 'Оберіть керівника',
    selectLevel: 'Оберіть рівень',
    enterName: 'Введіть назву підрозділу',
    noDepartments: 'Підрозділи не знайдені',
    rootLevel: 'Кореневий рівень',
  },
  
  // Department Levels
  departmentLevels: {
    company: 'Компанія',
    department: 'Департамент',
    division: 'Відділ',
    group: 'Група',
  },
  
  // Form Validation
  validation: {
    required: 'Це поле обов\'язкове',
    emailInvalid: 'Невірний формат email',
    minLength: 'Мінімальна довжина: {0} символів',
    maxLength: 'Максимальна довжина: {0} символів',
  },
  
  // Date and Time
  dateTime: {
    today: 'Сьогодні',
    yesterday: 'Вчора',
    tomorrow: 'Завтра',
    thisWeek: 'Цього тижня',
    thisMonth: 'Цього місяця',
    months: [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ],
    weekdays: [
      'Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'
    ],
    weekdaysShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  },
  
  // Common Phrases
  phrases: {
    noData: 'Немає даних для відображення',
    unknownDepartment: 'Невідомий підрозділ',
    unknownUser: 'Невідомий користувач',
    selectOption: 'Оберіть опцію',
    searchPlaceholder: 'Пошук...',
    itemsPerPage: 'Елементів на сторінці',
    totalItems: 'Всього елементів',
    page: 'Сторінка',
    of: 'з',
  }
};

export type TranslationKey = keyof typeof translations;
export type NestedTranslationKey<T> = T extends object ? keyof T : never;
