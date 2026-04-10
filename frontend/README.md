# frontend

`frontend` 是仓库里的 `Next.js` 前端，不是 `Vite` 项目。

## 当前配置

- 前端开发端口：`3001`
- 后端服务端口：`8080`
- 前端通过 Next 重写规则把 `/api/*` 转发到后端

默认代理目标：

```text
http://localhost:8080
```

## 启动前准备

先确保后端已经启动在 `8080`。

如果你想改后端地址，可以在 `frontend/.env.local` 里写：

```bash
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=/api
```

## 本地启动

```bash
cd frontend
npm install
npm run dev
```

启动后访问：

```text
http://localhost:3001
```

## 生产启动

```bash
cd frontend
npm install
npm run build
npm run start
```

生产服务同样会跑在：

```text
http://localhost:3001
```
