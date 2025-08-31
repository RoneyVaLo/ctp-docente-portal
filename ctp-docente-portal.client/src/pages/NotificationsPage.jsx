import React, { useState, useEffect } from "react";
import { notificationsApi } from "@/services/notificationsService";

export default function NotificationsPage() {
    const [messages, setMessages] = useState([]);

    const loadMessages = async () => {
        const data = await notificationsApi.getMessages({
            date: "2025-08-15",
            sectionId: 1,
            status: "SENT",
        });
        setMessages(data);
    };

    useEffect(() => {
        loadMessages();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notificaciones enviadas</h1>
            {messages.map(msg => (
                <div key={msg.id} className="p-4 bg-gray-800 rounded mb-2">
                    <p><strong>Estudiante:</strong> {msg.studentName}</p>
                    <p><strong>Mensaje:</strong> {msg.message}</p>
                    <p><strong>Estado:</strong> {msg.status}</p>
                    <p><strong>Fecha envío:</strong> {msg.sentAt ?? "Pendiente"}</p>
                </div>
            ))}
        </div>
    );
}