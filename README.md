# オンラインホワイトボード

リアルタイムで複数人が同時に描画できるオンラインホワイトボードアプリケーションです。

## 機能

- リアルタイム描画共有（WebSocket）
- 色の選択
- 線の太さ調整
- キャンバスクリア
- 描画履歴の保存と復元
- 接続状態の表示

## 技術スタック

### バックエンド (server/)
- Node.js
- Express
- WebSocket (ws)
- Herokuでホスティング

### フロントエンド (client/)
- React 18
- Vite
- Canvas API
- Vercelでホスティング

## ローカル開発

### 前提条件
- Node.js 18以上
- npm

### バックエンドの起動

```bash
cd server
npm install
npm start
```

サーバーは `http://localhost:3001` で起動します。

### フロントエンドの起動

```bash
cd client
npm install
npm run dev
```

クライアントは `http://localhost:3000` で起動します。

## デプロイ手順

### 1. Herokuへのバックエンドのデプロイ

```bash
# Heroku CLIをインストール（未インストールの場合）
# https://devcenter.heroku.com/articles/heroku-cli

# Herokuにログイン
heroku login

# serverディレクトリで実行
cd server

# Gitリポジトリを初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# Herokuアプリを作成
heroku create your-app-name

# デプロイ
git push heroku main

# ログを確認
heroku logs --tail
```

デプロイ後、`https://your-app-name.herokuapp.com` でアクセスできます。

### 2. Vercelへのフロントエンドのデプロイ

```bash
# Vercel CLIをインストール（未インストールの場合）
npm install -g vercel

# clientディレクトリで実行
cd client

# Vercelにログイン
vercel login

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

#### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

```
VITE_WS_URL=wss://your-app-name.herokuapp.com
```

または、Vercel CLIで設定：

```bash
vercel env add VITE_WS_URL
# 値を入力: wss://your-app-name.herokuapp.com
```

環境変数を設定した後、再デプロイ：

```bash
vercel --prod
```

## プロジェクト構成

```
.
├── server/              # バックエンド
│   ├── server.js       # WebSocketサーバー
│   ├── package.json    # 依存関係
│   ├── Procfile        # Heroku設定
│   └── .gitignore
│
├── client/              # フロントエンド
│   ├── src/
│   │   ├── App.jsx     # メインコンポーネント
│   │   ├── App.css     # スタイル
│   │   ├── main.jsx    # エントリーポイント
│   │   └── index.css   # グローバルスタイル
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json     # Vercel設定
│   ├── .env            # ローカル環境変数
│   ├── .env.example    # 環境変数のサンプル
│   └── .gitignore
│
└── README.md           # このファイル
```

## トラブルシューティング

### WebSocketが接続できない

1. バックエンドが正常に起動しているか確認
2. フロントエンドの環境変数 `VITE_WS_URL` が正しく設定されているか確認
3. Herokuの場合、`wss://`（SSL）を使用していることを確認
4. ブラウザのコンソールでエラーメッセージを確認

### Herokuでの接続が切れる

Herokuの無料プランでは30分間アクティビティがないとスリープ状態になります。
有料プランへのアップグレードを検討してください。

### Vercelでビルドエラーが出る

1. `node_modules`を削除して再インストール
2. `package.json`の依存関係を確認
3. Vercelのビルドログを確認

## ライセンス

MIT

## 作成者

Created with Claude Code
