export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isPhone = (value: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
  return phoneRegex.test(value);
};
