package com.cug.miniblog.personalCenter.utils;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // 固定密钥（32位以上，保证安全）
    private static final String SECRET_KEY_STR = "mySecretKey123456789012345678901234";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STR.getBytes());

    // 24小时过期
    private static final long EXPIRATION = 1000 * 60 * 60 * 24;

    // 生成 Token
    public static String generateToken(Long userId) {
        return generateToken(userId, null);
    }

    // 生成带角色信息的 Token
    public static String generateToken(Long userId, Integer role) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        if (role != null) {
            claims.put("role", role);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SECRET_KEY)
                .compact();
    }

    // 最新写法：解析 token（无弃用警告）
    public Long extractUserId(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public Integer extractUserRole(String token) {
        Object role = parseClaims(token).get("role");
        if (role instanceof Integer) {
            return (Integer) role;
        }
        if (role instanceof Number) {
            return ((Number) role).intValue();
        }
        return null;
    }

    // 最新写法：校验 token（无弃用警告）
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
