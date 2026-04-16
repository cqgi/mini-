package com.cug.miniblog.contextManagement.utils;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);

    // 7天过期
    private static final long EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000L;

    /**
     * 生成Token
     */
    public String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .signWith(SECRET_KEY) // 0.11.5 简化写法，自动识别算法
                .compact();
    }

    /**
     * 解析Token获取用户ID
     */
    public Long getUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY) // 0.11.5 新API
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

}
