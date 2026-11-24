// Même règle que PasswordPolicy côté Spring Boot :
// 8 caractères minimum, avec une majuscule, une minuscule et un chiffre.
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,100}$/;

export const PASSWORD_HINT =
  '8 caractères minimum, avec une majuscule, une minuscule et un chiffre.';

export interface PasswordCheck {
  label: string;
  ok: boolean;
}

export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { label: '8 caractères minimum', ok: value.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(value) },
    { label: 'Une minuscule', ok: /[a-z]/.test(value) },
    { label: 'Un chiffre', ok: /\d/.test(value) }
  ];
}

// Mot de passe provisoire aléatoire (cryptographiquement sûr) conforme à la règle.
export function generatePassword(length = 12): string {

  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;

  const pick = (chars: string): string => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return chars[buffer[0] % chars.length];
  };

  const characters = [pick(upper), pick(lower), pick(digits)];

  while (characters.length < length) {
    characters.push(pick(all));
  }

  // Mélange de Fisher-Yates
  for (let i = characters.length - 1; i > 0; i--) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join('');
}
