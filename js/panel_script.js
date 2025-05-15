// Variáveis de configuração MQTT (extraídas do código ESP32)
const mqtt_server = "832faee362a249b4929eeafa3ac41d6e.s1.eu.hivemq.cloud";
const mqtt_port = 8884; // Porta WSS para HiveMQ Cloud
const mqtt_user = "hivemq.webclient.1746800566955";
const mqtt_pass = "K>2<FWaR9iO#7:3Hmvwb";
const client_id = "web_client_" + parseInt(Math.random() * 100000); // ID de cliente único

// Definição dos cômodos e ícones (extraído do código ESP32)
const rooms = [ "Sala", "Cozinha", "Banheiro", "Lavabo", "Escada", "Garagem" ];
const icons = [ "fa-couch", "fa-utensils", "fa-bath", "fa-toilet", "fa-stairs", "fa-warehouse" ];
let room_states = [ false, false, false, false, false, false ]; // Estado inicial

let mqttClient;

// Função para verificar autenticação ao carregar a página
function checkAuthentication() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        window.location.href = "login.html";
    }
}

// Função para gerar os cartões dos cômodos dinamicamente
function generateRoomCards() {
    const dashboard = document.getElementById("dashboard-content");
    if (!dashboard) return;
    dashboard.innerHTML = ""; // Limpa conteúdo existente

    for (let i = 0; i < rooms.length; i++) {
        const roomName = rooms[i];
        const iconClass = icons[i];
        const isChecked = room_states[i] ? "checked" : "";
        const statusText = room_states[i] ? "LIGADO" : "DESLIGADO";

        const cardHtml = `
            <div class="room-card">
                <div class="room-header">${roomName}</div>
                <div class="room-body">
                    <div class="icon-container"><i class="fas ${iconClass} room-icon"></i></div>
                    <label class="switch">
                        <input type="checkbox" id="switch-${i}" ${isChecked} onchange="toggleRoom(${i}, '${roomName.toLowerCase()}')">
                        <span class="slider"></span>
                    </label>
                    <div class="status" id="status-${i}">${statusText}</div>
                </div>
            </div>
        `;
        dashboard.innerHTML += cardHtml;
    }
}

// Função para conectar ao broker MQTT
function connectMQTT() {
    mqttClient = new Paho.MQTT.Client(mqtt_server, mqtt_port, client_id);

    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    const connectOptions = {
        userName: mqtt_user,
        password: mqtt_pass,
        useSSL: true,
        onSuccess: onConnect,
        onFailure: onFailure
    };
    mqttClient.connect(connectOptions);
}

// Callback de sucesso na conexão MQTT
function onConnect() {
    console.log("Conectado ao broker MQTT!");
    // Subscrever aos tópicos de status de todos os cômodos
    for (let i = 0; i < rooms.length; i++) {
        const roomTopic = `casa/${rooms[i].toLowerCase()}/status`;
        mqttClient.subscribe(roomTopic);
        console.log("Inscrito no tópico: " + roomTopic);
    }
    // Solicitar estado inicial (opcional, se o ESP32 publicar ao conectar)
}

// Callback de falha na conexão MQTT
function onFailure(response) {
    console.error("Falha ao conectar ao MQTT: " + response.errorMessage);
    // Tentar reconectar após um tempo
    setTimeout(connectMQTT, 5000);
}

// Callback de perda de conexão MQTT
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Conexão MQTT perdida: " + responseObject.errorMessage);
        // Tentar reconectar
        connectMQTT(); 
    }
}

// Callback de chegada de mensagem MQTT
function onMessageArrived(message) {
    console.log("Mensagem recebida: " + message.payloadString + " no tópico: " + message.destinationName);
    const topicParts = message.destinationName.split("/");
    const roomNameFromTopic = topicParts[1]; // Ex: "sala"
    const newStatus = message.payloadString.toUpperCase(); // "ON" ou "OFF"

    const roomIndex = rooms.findIndex(room => room.toLowerCase() === roomNameFromTopic);

    if (roomIndex !== -1) {
        room_states[roomIndex] = (newStatus === "ON");
        updateRoomUI(roomIndex);
    }
}

// Função para atualizar a UI de um cômodo específico
function updateRoomUI(roomId) {
    const checkbox = document.getElementById(`switch-${roomId}`);
    const statusDiv = document.getElementById(`status-${roomId}`);

    if (checkbox && statusDiv) {
        checkbox.checked = room_states[roomId];
        statusDiv.innerText = room_states[roomId] ? "LIGADO" : "DESLIGADO";
        statusDiv.style.color = room_states[roomId] ? "#2ecc71" : "#95a5a6";
    }
}


// Função para alternar o estado de um cômodo (enviar comando MQTT)
function toggleRoom(roomId, roomName) {
    if (!mqttClient || !mqttClient.isConnected()) {
        alert("Cliente MQTT não conectado. Tente novamente em breve.");
        // Reverter o checkbox visualmente se a conexão falhar
        const checkbox = document.getElementById(`switch-${roomId}`);
        if(checkbox) checkbox.checked = !checkbox.checked;
        return;
    }

    const checkbox = document.getElementById(`switch-${roomId}`);
    const currentStatus = checkbox.checked;
    const command = currentStatus ? "ON" : "OFF";
    const topic = `casa/${roomName}/comando`; // Usar o nome do cômodo em minúsculas como no ESP32

    const message = new Paho.MQTT.Message(command);
    message.destinationName = topic;
    message.qos = 1; // Definir QoS para garantir a entrega

    try {
        mqttClient.send(message);
        console.log(`Comando ${command} enviado para ${topic}`);
        // Atualiza o estado visual imediatamente, mas o estado real virá via MQTT
        room_states[roomId] = currentStatus;
        updateRoomUI(roomId);

        // Animação de feedback (opcional, pois o status real virá via MQTT)
        const statusDiv = document.getElementById(`status-${roomId}`);
        if (statusDiv) {
            statusDiv.style.fontWeight = "bold";
            setTimeout(() => {
                statusDiv.style.fontWeight = "normal";
            }, 1000);
        }

    } catch (error) {
        console.error("Erro ao enviar mensagem MQTT: ", error);
        alert("Falha ao enviar comando. Verifique a conexão.");
        // Reverter o checkbox se o envio falhar
        checkbox.checked = !currentStatus;
        room_states[roomId] = !currentStatus;
        updateRoomUI(roomId);
    }
}

// Função de logout
function logout() {
    localStorage.removeItem("auth_token");
    if (mqttClient && mqttClient.isConnected()) {
        try {
            mqttClient.disconnect();
            console.log("Desconectado do MQTT.");
        } catch (error) {
            console.error("Erro ao desconectar do MQTT: ", error);
        }
    }
    window.location.href = "login.html";
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    checkAuthentication();
    generateRoomCards();
    connectMQTT();
});

