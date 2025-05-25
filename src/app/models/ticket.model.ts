import { User } from './user.model';

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketNumber: string;
  purchaseDate: Date;
  event?: any;
  user?: User;
} 