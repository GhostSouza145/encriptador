document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const messageInput = document.getElementById('message');
    const passwordInput = document.getElementById('password');
    const saltInput = document.getElementById('salt');
    const encryptedOutput = document.getElementById('encrypted');
    const encryptBtn = document.getElementById('encrypt-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text span');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    // Força da senha
    passwordInput.addEventListener('input', checkPasswordStrength);
    
    // Botão de encriptar
    encryptBtn.addEventListener('click', encryptMessage);
    
    // Botão de copiar
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Botão de limpar
    clearBtn.addEventListener('click', clearAll);
    
    // Verificar força da senha
    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        
        // Verificar comprimento
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Verificar caracteres diversos
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Atualizar a barra de força
        const width = Math.min(strength * 20, 100);
        let color, text;
        
        if (strength <= 1) {
            color = '#ff3b30'; // Vermelho
            text = 'Fraca';
        } else if (strength <= 3) {
            color = '#ff9500'; // Laranja
            text = 'Moderada';
        } else {
            color = '#34c759'; // Verde
            text = 'Forte';
        }
        
        strengthFill.style.width = width + '%';
        strengthFill.style.background = color;
        strengthText.textContent = text;
    }
    
    // Encriptar mensagem
    function encryptMessage() {
        const message = messageInput.value.trim();
        const password = passwordInput.value;
        const salt = saltInput.value.trim();
        
        if (!message) {
            showNotification('Por favor, digite uma mensagem para encriptar.', 'error');
            return;
        }
        
        if (!password) {
            showNotification('Por favor, digite uma senha para criptografia.', 'error');
            return;
        }
        
        try {
            // Usar salt fornecido ou gerar um aleatório
            const finalSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
            
            // Derivação de chave usando PBKDF2
            const key = CryptoJS.PBKDF2(password, finalSalt, {
                keySize: 256/32,
                iterations: 1000
            });
            
            // Gerar IV (Initialization Vector) aleatório
            const iv = CryptoJS.lib.WordArray.random(128/8);
            
            // Encriptar a mensagem usando AES
            const encrypted = CryptoJS.AES.encrypt(message, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Combinar IV com texto cifrado
            const combined = iv.concat(encrypted.ciphertext);
            const encryptedString = combined.toString(CryptoJS.enc.Base64);
            
            // Formatar a saída (criptografia + salt)
            const result = {
                encrypted: encryptedString,
                salt: finalSalt,
                algorithm: "AES-CBC-PBKDF2"
            };
            
            // Exibir o resultado
            encryptedOutput.value = JSON.stringify(result, null, 2);
            showNotification('Mensagem encriptada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao encriptar:', error);
            showNotification('Erro ao encriptar a mensagem. Tente novamente.', 'error');
        }
    }
    
    // Copiar para a área de transferência
    function copyToClipboard() {
        if (!encryptedOutput.value) {
            showNotification('Nenhuma mensagem encriptada para copiar.', 'error');
            return;
        }
        
        encryptedOutput.select();
        encryptedOutput.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            navigator.clipboard.writeText(encryptedOutput.value);
            showNotification('Texto copiado para a área de transferência!', 'success');
        } catch (error) {
            console.error('Erro ao copiar:', error);
            // Fallback para navegadores mais antigos
            try {
                document.execCommand('copy');
                showNotification('Texto copiado para a área de transferência!', 'success');
            } catch (err) {
                showNotification('Erro ao copiar o texto.', 'error');
            }
        }
    }
    
    // Limpar todos os campos
    function clearAll() {
        messageInput.value = '';
        passwordInput.value = '';
        saltInput.value = '';
        encryptedOutput.value = '';
        checkPasswordStrength();
        showNotification('Campos limpos com sucesso.', 'success');
    }
    
    // Mostrar notificação
    function showNotification(message, type = 'info') {
        notificationText.textContent = message;
        
        // Definir cor baseada no tipo
        if (type === 'error') {
            notification.style.background = '#ff3b30';
        } else if (type === 'success') {
            notification.style.background = '#34c759';
        } else {
            notification.style.background = '#2a6bc1';
        }
        
        // Mostrar a notificação
        notification.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Inicializar a verificação de força da senha
    checkPasswordStrength();
});
