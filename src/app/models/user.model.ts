export interface User {
  id: string;
  fullname: string;
  username: string;
  password: string;
 role: 'admin' | 'organizer' | 'client';
}
