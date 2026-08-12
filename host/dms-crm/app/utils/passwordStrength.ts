export type PasswordStrength = {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  barColor: string;
};

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      level: 0,
      label: "",
      color: "text-gray-400",
      barColor: "bg-gray-300",
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (LOWERCASE_REGEX.test(password)) score++;
  if (UPPERCASE_REGEX.test(password)) score++;
  if (NUMBER_REGEX.test(password)) score++;
  if (SPECIAL_REGEX.test(password)) score++;

  switch (score) {
    case 1:
      return {
        level: 1,
        label: "Very Weak",
        color: "text-red-600",
        barColor: "bg-red-500",
      };

    case 2:
      return {
        level: 2,
        label: "Weak",
        color: "text-orange-500",
        barColor: "bg-orange-500",
      };

    case 3:
      return {
        level: 3,
        label: "Medium",
        color: "text-yellow-500",
        barColor: "bg-yellow-500",
      };

    case 4:
    case 5:
      return {
        level: 4,
        label: "Strong",
        color: "text-green-600",
        barColor: "bg-green-500",
      };

    default:
      return {
        level: 0,
        label: "",
        color: "text-gray-400",
        barColor: "bg-gray-300",
      };
  }
};
