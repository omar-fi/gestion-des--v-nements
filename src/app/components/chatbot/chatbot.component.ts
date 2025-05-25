import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <!-- Chat Window -->
      <div class="chat-window" [class.open]="isOpen">
        <div class="chat-header">
          <div class="header-content">
            <i class="fas fa-robot chatbot-avatar"></i>
            <h3>Assistant Virtuel</h3>
          </div>
          <button class="close-btn" (click)="toggleChat()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="chat-messages" #chatMessages>
          <div *ngFor="let message of messages" 
               class="message" 
               [ngClass]="{'user-message': message.isUser, 'bot-message': !message.isUser}">
            <i *ngIf="!message.isUser" 
               class="fas fa-robot message-avatar"></i>
            <div class="message-content">
              {{ message.text }}
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Tapez votre message...">
          <button (click)="sendMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <!-- Chat Button -->
      <button class="chat-button" (click)="toggleChat()">
        <i class="fas" [ngClass]="isOpen ? 'fa-times' : 'fa-comments'"></i>
      </button>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3498db, #2980b9);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      transform: translateY(20px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .chat-window.open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .chat-header {
      padding: 15px 20px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chatbot-avatar {
      font-size: 24px;
      color: white;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message {
      display: flex;
      gap: 8px;
      max-width: 85%;
    }

    .message-avatar {
      font-size: 20px;
      color: #3498db;
      margin-top: auto;
    }

    .message-content {
      padding: 10px 15px;
      border-radius: 15px;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .user-message {
      flex-direction: row-reverse;
      align-self: flex-end;
    }

    .user-message .message-content {
      background: #e3f2fd;
      color: #1565c0;
      border-bottom-right-radius: 5px;
    }

    .bot-message {
      align-self: flex-start;
    }

    .bot-message .message-content {
      background: #f5f5f5;
      color: #333;
      border-bottom-left-radius: 5px;
    }

    .chat-input {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }

    .chat-input input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .chat-input input:focus {
      border-color: #3498db;
    }

    .chat-input button {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .chat-input button:hover {
      transform: scale(1.1);
    }

    @media (max-width: 480px) {
      .chat-window {
        width: calc(100% - 40px);
        height: calc(100% - 100px);
        bottom: 80px;
      }
    }
  `]
})
export class ChatbotComponent {
  isOpen = false;
  userInput = '';
  messages: { text: string; isUser: boolean }[] = [
    { text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?', isUser: false }
  ];

  // Réponses prédéfinies pour le chatbot
  private responses: { [key: string]: string } = {
    'bonjour': 'Bonjour ! Comment puis-je vous aider ?',
    'salut': 'Salut ! Que puis-je faire pour vous ?',
    'aide': 'Je peux vous aider avec :\n- La création d\'événements\n- L\'inscription aux événements\n- La gestion de votre compte\n- Les questions générales',
    'événement': 'Pour créer un événement, connectez-vous en tant qu\'organisateur. Pour vous inscrire à un événement, connectez-vous en tant que client.',
    'inscription': 'Pour vous inscrire à un événement, connectez-vous en tant que client et accédez au tableau de bord client.',
    'compte': 'Vous pouvez gérer votre compte dans les paramètres de votre tableau de bord.',
    'merci': 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.',
    'au revoir': 'Au revoir ! N\'hésitez pas à revenir si vous avez d\'autres questions.',
    'bye': 'Au revoir ! À bientôt !'
  };

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Ajouter le message de l'utilisateur
    this.messages.push({ text: this.userInput, isUser: true });

    // Générer une réponse
    const response = this.generateResponse(this.userInput.toLowerCase());
    this.messages.push({ text: response, isUser: false });

    // Réinitialiser l'input
    this.userInput = '';
  }

  private generateResponse(input: string): string {
    // Vérifier les réponses prédéfinies
    for (const [key, value] of Object.entries(this.responses)) {
      if (input.includes(key)) {
        return value;
      }
    }

    // Réponse par défaut
    return 'Je ne suis pas sûr de comprendre. Pourriez-vous reformuler votre question ?';
  }
} 