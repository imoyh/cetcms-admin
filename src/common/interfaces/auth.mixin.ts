import { Auth } from 'src/generated/graphql';

export interface AuthMixin {
  setAuth(auth: Auth): Auth;
  getAuth(): Auth;
}
