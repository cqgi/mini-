# MiniBlog 本地启动

## 1. 准备后端环境变量

复制根目录环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
DB_PASSWORD=你的本地 MySQL root 密码
ALIYUN_OSS_ACCESS_KEY_ID=你的阿里云 AccessKeyId
ALIYUN_OSS_ACCESS_KEY_SECRET=你的阿里云 AccessKeySecret
```

如果不演示头像或封面上传，OSS 两项可以先留空。

## 2. 准备数据库

本项目默认连接本地 MySQL：

```text
jdbc:mysql://localhost:3306/mini_blog
```

请先创建并导入 `mini_blog` 数据库。

## 3. 启动后端

在项目根目录运行：

```bash
scripts/start-backend-local.sh
```

后端地址：

```text
http://localhost:8080
```

## 4. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端地址：

```text
http://localhost:3001
```

前端会通过 `/api/*` 代理到 `http://localhost:8080`。
