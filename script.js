// Hotel Chulesi - Party Place Booking System
// Complete Frontend Application with localStorage

class HotelChulesi {
    constructor() {
        this.currentUser = null;
        this.selectedFlat = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.loadMessages();
        this.loadBookings();
    }

    bindEvents() {
        // Welcome screen
        document.getElementById('getStartedBtn').addEventListener('click', () => this.openAuthModal());

        // Auth modal
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('switchAuth').addEventListener('click', () => this.toggleAuthMode());
        document.getElementById('closeAuth').addEventListener('click', () => this.closeModal('authModal'));

        // Dashboard
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Booking buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openPaymentModal(e));
        });

        // Payment modal
        document.getElementById('closePayment').addEventListener('click', () => this.closeModal('paymentModal'));
        document.getElementById('confirmPayment').addEventListener('click', () => this.processPayment());

        // Success modal
        document.getElementById('closeSuccess').addEventListener('click', () => this.closeModal('successModal'));

        // Navigation
        document.getElementById('backToDashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('backToDashboard2').addEventListener('click', () => this.showDashboard());
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    // Authentication System
    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
            this.updateUserDisplay();
        }
    }

    handleAuth(e) {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;

        if (!name || !email || !password) {
            this.showMessage('Please fill all fields', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const isLogin = document.getElementById('modalTitle').textContent === 'Login';
        const userIndex = users.findIndex(u => u.email === email);

        if (isLogin) {
            // Login
            if (userIndex === -1 || users[userIndex].password !== password) {
                this.showMessage('Invalid email or password', 'error');
                return;
            }
            this.currentUser = users[userIndex];
        } else {
            // Register
            if (userIndex !== -1) {
                this.showMessage('User already exists', 'error');
                return;
            }
            this.currentUser = { name, email, password };
            users.push(this.currentUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.closeModal('authModal');
        this.showDashboard();
        this.updateUserDisplay();
        this.clearAuthForm();
    }

    toggleAuthMode() {
        const title = document.getElementById('modalTitle');
        const switchText = document.getElementById('switchAuth');
        const isLogin = title.textContent === 'Login';

        if (isLogin) {
            title.textContent = 'Register';
            switchText.innerHTML = 'Already have account? <span>Login</span>';
        } else {
            title.textContent = 'Login';
            switchText.innerHTML = "Don't have account? <span>Register</span>";
        }
    }

    updateUserDisplay() {
        document.getElementById('userName').textContent = this.currentUser.name;
    }

    clearAuthForm() {
        document.getElementById('authForm').reset();
        document.getElementById('nameInput').removeAttribute('disabled');
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showWelcome();
    }

    // UI Navigation
    openAuthModal() {
        document.getElementById('authModal').classList.add('active');
        document.getElementById('modalTitle').textContent = 'Login';
        document.getElementById('switchAuth').innerHTML = "Don't have account? <span>Register</span>";
    }

    showWelcome() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('welcomeScreen').classList.add('active');
    }

    showDashboard() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('dashboard').classList.add('active');
    }

    openChat() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('chatSection').classList.add('active');
        this.scrollToBottom();
    }

    showBookings() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('bookingsSection').classList.add('active');
        this.renderBookings();
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Booking System
    openPaymentModal(e) {
        if (!this.currentUser) {
            this.openAuthModal();
            return;
        }

        const flatCard = e.target.closest('.flat-card');
        this.selectedFlat = {
            id: flatCard.dataset.flat,
            name: flatCard.querySelector('h3').textContent,
            price: flatCard.querySelector('.price').textContent
        };

        document.getElementById('bookingFlatName').textContent = this.selectedFlat.name;
        document.getElementById('bookingPrice').textContent = this.selectedFlat.price;
        document.getElementById('paymentModal').classList.add('active');
    }

    processPayment() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Simulate payment processing
        document.getElementById('confirmPayment').textContent = 'Processing...';
        document.getElementById('confirmPayment').disabled = true;

        setTimeout(() => {
            const booking = {
                id: 'BK' + Date.now(),
                flat: this.selectedFlat,
                userEmail: this.currentUser.email,
                paymentMethod,
                date: new Date().toLocaleDateString()
            };

            // Save booking
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push(booking);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            this.closeModal('paymentModal');
            document.getElementById('successModal').classList.add('active');
            
            this.selectedFlat = null;
        }, 2000);
    }

    renderBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const userBookings = bookings.filter(b => b.userEmail === this.currentUser.email);
        const container = document.getElementById('bookingsList');

        if (userBookings.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 50px;">No bookings yet. Book your party flat now!</p>';
            return;
        }

        container.innerHTML = userBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header">
                    <h3>${booking.flat.name}</h3>
                    <span class="booking-id">${booking.id}</span>
                </div>
                <div class="booking-details">
                    <p><i class="fas fa-rupee-sign"></i> ${booking.flat.price}</p>
                    <p><i class="fas fa-credit-card"></i> ${booking.paymentMethod.toUpperCase()}</p>
                    <p><i class="fas fa-calendar"></i> ${booking.date}</p>
                </div>
            </div>
        `).join('');
    }

    // Chat System
    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const container = document.getElementById('chatMessages');
        container.innerHTML = messages.map(msg => this.createMessageElement(msg)).join('');
        this.scrollToBottom();
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;

        const message = {
            id: Date.now(),
            userEmail: this.currentUser.email,
            text,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Save and display user message
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        this.loadMessages();
        input.value = '';

        // Auto-reply from owner
        this.scheduleOwnerReply();
    }

    scheduleOwnerReply() {
        const replies = [
            "Perfect! What type of party are you planning? 🎉",
            "Great choice! When do you want to book the flat? 📅",
            "Excellent! Any special requirements for your event?",
            "Awesome! We have all amenities ready for your party!",
            "Perfect timing! The flat will be ready for your celebration!",
            "Wonderful! Shall I reserve it for you right away?",
            "Great! What kind of music or decorations do you need?",
            "Fantastic! We specialize in wedding and party events!"
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        setTimeout(() => {
            const ownerMessage = {
                id: Date.now() + 1,
                userEmail: this.currentUser.email,
                text: randomReply,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };

            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            messages.push(ownerMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
            this.loadMessages();
        }, Math.random() * 2000 + 1000); // 1-3 seconds
    }

    createMessageElement(msg) {
        const bubbleClass = msg.isUser ? 'user-message' : 'owner-message';
        return `
            <div class="message ${bubbleClass}">
                <div class="message-bubble">
                    <p>${msg.text}</p>
                    <span class="message-time">${msg.timestamp}</span>
                </div>
            </div>
        `;
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chatMessages');
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    showMessage(text, type = 'success') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hotelApp = new HotelChulesi();
});

// Animations utility
const animateCSS = (element, animation, callback) => {
    element.classList.add('animate__animated', `animate__${animation}`);
    function handleAnimationEnd() {
        element.classList.remove('animate__animated', `animate__${animation}`);
        element.removeEventListener('animationend', handleAnimationEnd);
        if (callback) callback();
    }
    element.addEventListener('animationend', handleAnimationEnd);
};
