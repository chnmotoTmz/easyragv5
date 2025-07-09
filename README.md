# RAG CLIシステム

## 概要
RAG（Retrieval-Augmented Generation）CLIシステムは、高度なテキスト分析技術を使用したドキュメント処理と類似性検索のためのコマンドラインアプリケーションです。TF-IDFアルゴリズムを活用してドキュメントの類似性を計算し、使いやすい検索インターフェースを提供します。

## インストール方法

1. **Node.jsのインストール**: 
   - [nodejs.org](https://nodejs.org/)からNode.jsをダウンロードしてインストールします。これにより、プロジェクトの依存関係を管理するために必要なnpm（Node Package Manager）もインストールされます。

2. **リポジトリのクローン**:
   ```bash
   git clone <repository-url>
   cd rag-cli-system
   ```

3. **依存関係のインストール**:
   `package.json`に記載された必要な依存関係をインストールするために、以下のコマンドを実行します：
   ```bash
   npm install
   ```

## 使用方法

### CLIの実行
RAG CLIシステムを起動するには、以下のコマンドを使用します：
```bash
node src/app.js
```

### 利用可能なコマンド

#### ドキュメント検索
ロードされたドキュメントを検索：
```bash
node src/app.js search "検索したいキーワード"
```

#### バッチ処理
複数のドキュメントを一括処理：
```bash
node src/app.js batch /ドキュメントのパス
```

#### ドキュメント管理
- **ドキュメントの追加**:
  ```bash
  node src/app.js add /ドキュメントのパス
  ```
- **ドキュメントの削除**:
  ```bash
  node src/app.js remove ドキュメントID
  ```
- **ドキュメント一覧**:
  ```bash
  node src/app.js list
  ```

### 設定
システムは、ルートディレクトリの`config.json`ファイルで設定できます：
```json
{
  "similarity_threshold": 0.7,
  "max_results": 10
}
```

## 機能一覧

### 基本機能
- **TF-IDFベースの検索**: 文書間の類似性を計算し、関連度の高い文書を検索
- **バッチ処理**: 複数のドキュメントを同時に処理
- **ドキュメント管理**: ドキュメントの追加、削除、一覧表示
- **設定のカスタマイズ**: 類似度閾値や検索結果数の調整

## ドキュメント
詳細な情報については、`docs`ディレクトリ内の以下のドキュメントを参照してください：
- [セットアップガイド](docs/setup.md)
- [使用方法](docs/usage.md)

## 貢献について
貢献を歓迎します！バグ報告や機能リクエストについては、プルリクエストの作成やイシューの報告をお願いします。

## ライセンス
このプロジェクトはMITライセンスの下で提供されています。詳細についてはLICENSEファイルを参照してください。

## EXEファイルのビルドと実行

### ビルド方法

1. **pkg のインストール**:
   ```bash
   npm install -g pkg
   ```

2. **ビルドの実行**:
   ```bash
   npm run build
   ```
   または直接:
   ```bash
   pkg .
   ```

ビルドされたEXEファイルは `dist` フォルダに出力されます。

### EXE実行方法

生成されたEXEファイルは以下のように実行できます：

```bash
.\dist\rag-cli-system.exe
```

コマンド例：
```bash
# 検索実行
.\dist\rag-cli-system.exe search "検索キーワード"

# ドキュメント追加
.\dist\rag-cli-system.exe add ファイルパス

# ドキュメント一覧表示
.\dist\rag-cli-system.exe list
```

### パッケージ設定

`package.json`には以下のビルド設定が含まれています：

```json
{
  "pkg": {
    "targets": [
      "node18-win-x64"
    ],
    "outputPath": "dist"
  }
}
```

### ビルドスクリプトの追加

package.jsonのscriptsセクションに以下を追加してください：

````json
{
  "scripts": {
    "build": "pkg .",
    "build:win": "pkg . --targets node18-win-x64 --output dist/rag-cli-system.exe"
  }
}
````# easyragv5
