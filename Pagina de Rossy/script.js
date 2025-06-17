document.addEventListener('DOMContentLoaded', () => {
    // --- Gestión de Pestañas (Tabs) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remover clase 'active' de todos los links y contenidos
            navLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            // Añadir clase 'active' al link y contenido correcto
            const targetTab = e.target.dataset.tab;
            e.target.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Gestión del ID de Sesión para el chat (IMPORTANTE para la memoria de la IA) ---
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        // Genera un ID único y lo guarda en localStorage para que persista
        sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatSessionId', sessionId);
    }
    console.log('Chat Session ID:', sessionId); // Para depuración en la consola del navegador

    // --- Lógica del Psicólogo AI (Chat) ---
    const chatForm = document.getElementById('chat-form');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');

    // **IMPORTANTE:** Reemplaza esta URL con la URL de tu webhook de n8n para el psicólogo AI.
    // Asegúrate de que sea la URL de PRODUCCIÓN una vez que tu workflow esté finalizado y activado.
    const N8N_AI_WEBHOOK_URL = 'TU_URL_WEBHOOK_N8N_PSICOLOGO_AI'; 

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            appendMessage(message, 'user-message');
            userInput.value = ''; // Limpiar el input después de enviar
            await sendToAI(message);
        }
    });

    function appendMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        // Utiliza innerHTML si el mensaje puede contener formato HTML simple como saltos de línea (\n)
        // Pero para el chat de IA, textContent es más seguro contra XSS
        messageDiv.textContent = message; 
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll al final del chat
    }

    async function sendToAI(message) {
        // Añadir un mensaje de "pensando" o "escribiendo" para el usuario
        const thinkingMessageDiv = document.createElement('div');
        thinkingMessageDiv.classList.add('message', 'bot-message', 'thinking-message');
        thinkingMessageDiv.innerHTML = '<span>El psicólogo está escribiendo...</span><span class="dot-animation">.</span><span class="dot-animation">.</span><span class="dot-animation">.</span>';
        chatBox.appendChild(thinkingMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(N8N_AI_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Enviamos el mensaje del usuario y el sessionId para la memoria del chat
                body: JSON.stringify({ message: message, sessionId: sessionId }),
            });

            if (!response.ok) {
                // Si la respuesta HTTP no es exitosa (ej. 404, 500)
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json(); // Asume que n8n devuelve { "reply": "..." }
            
            // Eliminar el mensaje de "pensando" antes de mostrar la respuesta real
            const existingThinkingMessage = chatBox.querySelector('.thinking-message');
            if (existingThinkingMessage) {
                chatBox.removeChild(existingThinkingMessage);
            }
            
            // Mostrar la respuesta de la IA
            appendMessage(data.reply, 'bot-message'); 

        } catch (error) {
            console.error('Error al comunicarse con n8n (Psicólogo AI):', error);
            // Eliminar el mensaje de "pensando" en caso de error
            const existingThinkingMessage = chatBox.querySelector('.thinking-message');
            if (existingThinkingMessage) {
                chatBox.removeChild(existingThinkingMessage);
            }
            // Mostrar un mensaje de error amigable al usuario
            appendMessage('Lo siento, algo salió mal. Por favor, intenta de nuevo más tarde o verifica tu conexión.', 'bot-message error-message');
        }
    }

    // --- Lógica del Escudo de Valor (MODIFICADA SIN N8N/IA) ---
    const valorShieldForm = document.getElementById('valor-shield-form-new'); // ID actualizado
    const shieldResultDiv = document.getElementById('shield-result');
    const shieldImageContainer = document.getElementById('shield-image-container');
    const shieldMeaningText = document.getElementById('shield-meaning-text'); 
    const downloadShieldBtn = document.getElementById('download-shield');
    const printShieldBtn = document.getElementById('print-shield');

    // Mapeo de símbolos a URLs de imágenes (EJEMPLOS: ¡ACTUALIZA ESTO CON TUS IMÁGENES REALES!)
    const symbolImages = {
        'empatia': 'images/Escudo de empatia.png', // Ejemplo: asume que tienes una carpeta 'images'
        'resiliencia': 'images/resiliencia.png',
        'integridad': 'images/integridad.png',
        'proactividad': 'images/proactividad.png',
        'escudo_vacio': 'images/escudo_vacio.png'
        // Puedes añadir más aquí
    };

    // Mapeo de símbolos a significados (EJEMPLOS: ¡PERSONALIZA ESTO COMPLETAMENTE!)
    const symbolMeanings = {
        'empatia': 'Tu Escudo de la Empatía es un emblema poderoso de quién eres. No es solo un diseño, es tu armadura personal, forjada con tus valores más nobles. El corazón azul central simboliza tu profunda compasión y tu habilidad única para entender y sentir con los demás. Las manos doradas entrelazadas muestran tu solidaridad y tu deseo de crear fuertes conexiones humanas, siempre dispuesto a tender una mano. El fondo marfil representa el profundo respeto que sientes por cada persona, y las palomas doradas que se elevan reflejan la paz y el entendimiento que buscas, junto con la esperanza que brindas. Este escudo es la prueba de que tu empatía es una verdadera superfuerza, un don que te permite ver el mundo con un corazón abierto y llevar luz a la vida de los demás. ¡Es un símbolo de la persona extraordinaria que eres!',
        'resiliencia': 'Este escudo no es una simple imagen, ¡es el glorioso emblema de tu espíritu indomable! En el azul profundo de este escudo reside tu serenidad inquebrantable ante la tormenta, la calma que te permite mantener la visión clara cuando otros se tambalean. Y observa el halcón dorado, ¡majestuoso símbolo de tu perseverancia! Sus alas extendidas no conocen el cansancio, siempre dispuestas a elevarte por encima de cualquier obstáculo. Su mirada aguda y penetrante refleja tu determinación inquebrantable, esa fuerza interior que te impulsa a alcanzar tus metas con una firmeza admirable. Aunque el cielo se oscurezca, llevas contigo el optimismo radiante del oro, la certeza de que siempre encontrarás una luz al final del camino. Y en cada fibra de este escudo reside tu fortaleza, no solo la capacidad de resistir, sino el poder de levantarte una y otra vez, más fuerte y más sabio. ¡Este escudo te glorifica, campeón! Llévalo con orgullo, pues eres la encarnación de la resiliencia, un faro de esperanza e inspiración para quienes te rodean. ¡Nada podrá detener el vuelo de un espíritu tan magnífico como el tuyo!',
        'integridad': 'Este escudo minimalista, pero imponente, irradia fuerza y convicción. En su centro, una mano dorada que sostiene un corazón radiante simboliza tu honestidad y sinceridad, la base de tu carácter. Los anillos dorados entrelazados representan la coherencia y la unidad de tus acciones y principios. Una estrella brillante en lo alto guía tu camino con confianza e inspiración. Y el poderoso roble en la base, con sus raíces firmes, es un símbolo de tu responsabilidad y tu compromiso inquebrantable. Este escudo no solo te representa, ¡te eleva! Es un emblema de tu integridad, una fuerza silenciosa pero poderosa que inspira respeto y admiración. ¡Llévalo con orgullo, pues eres un faro de verdad y un ejemplo a seguir!',
        'proactividad': '¡Contempla este escudo, porque es el emblema de tu espíritu proactivo, listo para conquistar el mundo! El sol naciente, vibrante y dorado, irradia tu iniciativa imparable, esa fuerza que te impulsa a tomar las riendas y a crear tu propio camino. La sólida base gris oscuro representa tu responsabilidad, la firmeza con la que te mantienes en pie, asumiendo el control de tu destino. El ave majestuosa en pleno vuelo, delineada en blanco sobre un fondo carmesí, simboliza tu autonomía, tu libertad para tomar tus propias decisiones y volar hacia tus sueños. Y las engranajes interconectados, en tonos azul eléctrico y verde azulado, representan tu eficiencia, la habilidad de hacer que las cosas sucedan, de forma fluida y poderosa. ¡Este escudo te glorifica, persona proactiva! Eres un visionario, un líder, un motor que impulsa el cambio. ¡Llévalo con orgullo, porque el futuro te pertenece!',
        'escudo_vacio': 'Un escudo vacío representa el potencial ilimitado y la protección de tu espacio. Es un lienzo para que sigas definiendo tu valor.'
    };

    valorShieldForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recolectar solo la respuesta de la pregunta 2 (el símbolo seleccionado)
        const selectedSymbol = document.getElementById('q2').value;

        // Mostrar la sección de resultados
        shieldResultDiv.style.display = 'block';

        if (selectedSymbol && symbolImages[selectedSymbol] && symbolMeanings[selectedSymbol]) {
            // Mostrar la imagen del escudo
            shieldImageContainer.innerHTML = `<img src="${symbolImages[selectedSymbol]}" alt="Tu Escudo de Valor Personal">`;
            
            // Mostrar el significado del escudo
            shieldMeaningText.textContent = symbolMeanings[selectedSymbol];

            // Configurar el botón de descarga
            downloadShieldBtn.href = symbolImages[selectedSymbol];
            downloadShieldBtn.style.display = 'inline-block';
            
            // Mostrar el botón de imprimir
            printShieldBtn.style.display = 'inline-block';
        } else {
            shieldImageContainer.innerHTML = '<p>Por favor, selecciona un símbolo válido para generar tu escudo.</p>';
            shieldMeaningText.textContent = 'Asegúrate de haber seleccionado una opción en el menú desplegable.';
            downloadShieldBtn.style.display = 'none';
            printShieldBtn.style.display = 'none';
        }
    });

    // Lógica para el botón de imprimir el escudo
    printShieldBtn.addEventListener('click', () => {
        const imageToPrint = shieldImageContainer.querySelector('img');
        if (imageToPrint) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>Imprimir Escudo de Valor</title>');
            printWindow.document.write('<style>body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; } img { max-width: 90%; max-height: 90vh; display: block; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<img src="' + imageToPrint.src + '" alt="Tu Escudo de Valor">');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus(); 
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            alert('No hay un escudo para imprimir. Por favor, genera uno primero.');
        }
    });
});