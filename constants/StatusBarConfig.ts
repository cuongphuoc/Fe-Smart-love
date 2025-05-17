interface StatusBarConfig {
  backgroundColor: string;
  barStyle: 'light-content' | 'dark-content';
}

interface TabStatusBarConfig {
  [key: string]: StatusBarConfig;
}

export const TabStatusBarColors: TabStatusBarConfig = {
  index: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },
  ToDoList: {
    backgroundColor: '#f03a6c',
    barStyle: 'light-content',
  },
  CoupleFund: {
    backgroundColor: '#FF5277',
    barStyle: 'light-content',
  },
  postdiary: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },
  viewdiary: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },
  CalendarScreen: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },
  login: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },  SignUpScreen: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
  },
};

// Add default export for the file
export default TabStatusBarColors;