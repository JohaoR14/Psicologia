document.addEventListener('DOMContentLoaded', () => {
    const generarEscudoBtn = document.getElementById('generar-escudo-btn');
    const cualidadSelect = document.getElementById('cualidad');
    const escudoResultadoDiv = document.getElementById('escudo-resultado');
    const escudoExplicacion = document.getElementById('escudo-explicacion');

    // Referencias a todas las imágenes de escudo
    const escudoEmpatia = document.getElementById('escudo-empatia');
    const escudoResiliencia = document.getElementById('escudo-resiliencia');
    const escudoIntegridad = document.getElementById('escudo-integridad');
    const escudoProactividad = document.getElementById('escudo-proactividad');

    // Mapeo de cualidades a las explicaciones (las imágenes ya están en HTML)
    const escudosExplicaciones = {
        "Empatia": "El Escudo de la Empatía representa tu profunda capacidad para entender y compartir los sentimientos de los demás. Con un corazón abierto y manos entrelazadas, simbolizas la conexión humana y el apoyo mutuo. Las palomas que se elevan sobre el corazón azul simbolizan la paz y la comprensión que emanan de tu habilidad para ponerte en el lugar del otro. Tu valor reside en tu compasión y en la fuerza que encuentras al conectar con el mundo a través del corazón.",
        "Resiliencia": "El Escudo de la Resiliencia, con su majestuoso halcón de alas extendidas, simboliza tu increíble capacidad para sobreponerte a la adversidad. Al igual que el halcón se eleva por encima de las tormentas, tú encuentras la fuerza para recuperarte, adaptarte y crecer frente a los desafíos. Este escudo representa tu espíritu indomable y tu habilidad para transformar los obstáculos en oportunidades de vuelo y fortaleza. Tu valor reside en tu tenacidad y en tu innata capacidad para renacer de cada prueba.",
        "Integridad": "El Escudo de la Integridad destaca por un corazón en la mano, entrelazado con anillos que simbolizan la unión y el compromiso, y un árbol fuerte y enraizado en la base. Esto refleja tu compromiso inquebrantable con tus principios, valores y honestidad. Al igual que el árbol se mantiene firme, tú te mantienes fiel a ti mismo y a tus convicciones, inspirando confianza y respeto en los demás. Tu valor radica en tu transparencia, tu rectitud moral y en la coherencia entre lo que dices y haces.",
        "Proactividad": "El Escudo de la Proactividad, con sus engranajes en movimiento bajo un sol naciente y un ave que emprende el vuelo, simboliza tu iniciativa y tu capacidad para tomar el control de tu destino. Representa tu habilidad para anticipar desafíos, innovar y actuar antes de que las circunstancias te superen. Los engranajes denotan el trabajo en equipo y la eficiencia, mientras que el ave libre ilustra tu visión de futuro y tu impulso para generar cambios positivos. Tu valor reside en tu espíritu emprendedor y en tu habilidad para transformar las ideas en acción."
    };

    // Función para ocultar todas las imágenes de escudo
    function hideAllEscudoImages() {
        escudoEmpatia.classList.add('hidden');
        escudoResiliencia.classList.add('hidden');
        escudoIntegridad.classList.add('hidden');
        escudoProactividad.classList.add('hidden');
    }

    generarEscudoBtn.addEventListener('click', () => {
        const cualidadSeleccionada = cualidadSelect.value;

        if (cualidadSeleccionada) {
            // Ocultar todas las imágenes primero
            hideAllEscudoImages();

            // Mostrar la imagen correcta y su explicación
            escudoExplicacion.textContent = escudosExplicaciones[cualidadSeleccionada];
            escudoResultadoDiv.style.display = 'block';

            // Mostrar la imagen correspondiente
            switch (cualidadSeleccionada) {
                case 'Empatia':
                    escudoEmpatia.classList.remove('hidden');
                    break;
                case 'Resiliencia':
                    escudoResiliencia.classList.remove('hidden');
                    break;
                case 'Integridad':
                    escudoIntegridad.classList.remove('hidden');
                    break;
                case 'Proactividad':
                    escudoProactividad.classList.remove('hidden');
                    break;
            }
        } else {
            alert('Por favor, selecciona una cualidad para generar tu Escudo de Valor.');
            escudoResultadoDiv.style.display = 'none';
            hideAllEscudoImages(); // Asegurarse de que no se muestre ninguna imagen si no hay selección
        }
    });

    // Lógica para el chat con el psicólogo de IA
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    // !!! IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU WEBHOOK DE N8N !!!
    const N8N_WEBHOOK_URL = 'TU_URL_DE_WEBHOOK_N8N_AQUI'; 
    
    // Generar un ID de usuario único para la sesión (como en WhatsApp)
    let userId = localStorage.getItem('chatUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + Math.floor(Math.random() * 100000); 
        localStorage.setItem('chatUserId', userId);
    }

    function addMessage(message, sender) {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        if (sender === 'user') {
            messageBubble.classList.add('message-user');
        } else {
            messageBubble.classList.add('message-ai');
        }
        messageBubble.textContent = message;
        chatMessages.appendChild(messageBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll al final
    }

    sendChatBtn.addEventListener('click', async () => {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user');
        chatInput.value = ''; // Limpiar input

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    userId: userId 
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
            }

            const data = await response.json();
            const aiResponse = data.response; 
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Error al comunicarse con el psicólogo IA:', error);
            addMessage('Lo siento, hubo un problema al conectar con el psicólogo IA. Por favor, asegúrate de que la URL de tu webhook esté correcta y n8n esté activo. Inténtalo de nuevo más tarde.', 'ai');
        }
    });

    // Permitir enviar mensaje con Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatBtn.click();
        }
    });

    // Mensaje de bienvenida inicial del psicólogo IA
    addMessage('¡Hola! Soy tu psicólogo de IA. ¿En qué puedo ayudarte hoy? Recuerda que estoy aquí para escucharte y que puedo ofrecerte apoyo emocional.', 'ai');
});
