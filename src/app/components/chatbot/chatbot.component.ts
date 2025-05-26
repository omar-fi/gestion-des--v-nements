import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.open]="isOpen">
      <div class="chatbot-header" (click)="toggleChat()">
        <span>Assistant Virtuel</span>
        <button class="close-btn" (click)="toggleChat(); $event.stopPropagation()">×</button>
      </div>
      
      <div class="chatbot-messages" #messageContainer>
        <div *ngFor="let message of messages" class="message" [class.bot]="message.isBot" [class.user]="!message.isBot">
          <div class="message-content">
            {{ message.text }}
          </div>
          <div class="message-time">
            {{ message.timestamp | date:'HH:mm' }}
          </div>
        </div>
      </div>
      
      <div class="chatbot-input">
        <input 
          type="text" 
          [(ngModel)]="userInput" 
          (keyup.enter)="sendMessage()"
          placeholder="Tapez votre message..."
          [disabled]="!isOpen"
        >
        <button (click)="sendMessage()" [disabled]="!isOpen || !userInput.trim()">
          Envoyer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
      transform: translateY(calc(100% - 50px));
      z-index: 1000;
    }

    .chatbot-container.open {
      transform: translateY(0);
    }

    .chatbot-header {
      background: linear-gradient(135deg, #2c3e50, #3498db);
      color: white;
      padding: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      position: relative;
    }

    .message.bot {
      align-self: flex-start;
      background: #f0f2f5;
      color: #1a1a1a;
    }

    .message.user {
      align-self: flex-end;
      background: #3498db;
      color: white;
    }

    .message-time {
      font-size: 0.7rem;
      margin-top: 0.25rem;
      opacity: 0.7;
    }

    .chatbot-input {
      padding: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      gap: 0.5rem;
    }

    input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    input:focus {
      outline: none;
      border-color: #3498db;
    }

    button {
      padding: 0.75rem 1.5rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    button:hover:not(:disabled) {
      background: #2980b9;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ChatbotComponent implements AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
  isOpen: boolean = false;
  userInput: string = '';
  messages: Message[] = [
    {
      text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider ?',
      isBot: true,
      timestamp: new Date()
    }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Ajouter le message de l'utilisateur
    this.messages.push({
      text: this.userInput,
      isBot: false,
      timestamp: new Date()
    });

    // Simuler une réponse du bot
    setTimeout(() => {
      this.messages.push({
        text: this.getBotResponse(this.userInput),
        isBot: true,
        timestamp: new Date()
      });
      this.scrollToBottom();
    }, 1000);

    this.userInput = '';
    this.scrollToBottom();
  }

  private getBotResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    if (input.includes('bonjour') || input.includes('salut')) {
      return 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    }
    
    if (input.includes('événement') || input.includes('event')) {
      return 'Je peux vous aider à trouver des événements ou à réserver des tickets. Que souhaitez-vous faire ?';
    }
    
    if (input.includes('ticket') || input.includes('réservation')) {
      return 'Pour réserver un ticket, il vous suffit de cliquer sur le bouton "Réserver" à côté de l\'événement qui vous intéresse.';
    }
    
    if (input.includes('merci')) {
      return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.';
    }
    
    return 'Je ne suis pas sûr de comprendre. Pourriez-vous reformuler votre question ?';
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Erreur lors du défilement:', err);
    }
  }
} 