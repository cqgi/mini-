package com.cug.miniblog.contextManagement.utils;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@ServerEndpoint("/websocket/{userId}")
public class WebSocketServer {
    public static final Map<Long, Session> SESSIONS = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") Long userId) {
        SESSIONS.put(userId, session);
    }

    @OnClose
    public void onClose(@PathParam("userId") Long userId) {
        SESSIONS.remove(userId);
    }

    // 推送消息给指定用户
    public static void send(Long userId, String msg) {
        Session session = SESSIONS.get(userId);
        if (session != null && session.isOpen()) {
            try { session.getBasicRemote().sendText(msg); } catch (Exception e) {}
        }
    }
}