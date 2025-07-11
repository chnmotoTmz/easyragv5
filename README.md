# RAG CLIシステム

## 概要
RAG（Retrieval-Augmented Generation）CLIシステムは、高度なテキスト分析技術を使用したドキュメント処理と類似性検索のためのコマンドラインアプリケーションです。TF-IDFアルゴリズムを活用してドキュメントの類似性を計算し、使いやすい検索インターフェースを提供します。

## ⚡ 最新の改善点（2025年7月）

### 大語彙データセット対応
- **問題**: 149,598語の大語彙でメモリ不足エラーが発生
- **解決**: スパースベクトル実装でメモリ使用量を90%削減
- **効果**: 4GBメモリ制限内で大規模日本語文書検索が可能に

### パフォーマンス最適化
- **IDF計算**: O(n²) → O(n) に改善、処理時間を20秒→3秒に短縮
- **メモリ効率**: 密ベクトル(100MB) → スパースベクトル(10MB)
- **Node.js設定**: ヒープサイズを8GBに拡張

### 日本語N-gram処理
- **高精度トークン化**: カタカナ語、漢字列、英単語の重み付け処理
- **ストップワード対応**: 日本語・英語のストップワード除去
- **進捗可視化**: 処理進行状況とメモリ使用量をリアルタイム表示

## インストール方法

### 必要環境
- **Node.js**: v18以上推奨
- **メモリ**: 8GB以上推奨（大語彙データセット対応）
- **OS**: Windows, macOS, Linux

### セットアップ
1. **Node.jsのインストール**: 
   - [nodejs.org](https://nodejs.org/)からNode.jsをダウンロード

2. **リポジトリのクローン**:
   ```bash
   git clone <repository-url>
   cd rag-cli-system
   ```

3. **依存関係のインストール**:
   ```bash
   npm install
   ```

4. **動作確認**:
   ```bash
   # ヘルプ表示
   npm start help
   
   # サンプル検索
   npm run search articles.txt "テスト検索" 3
   ```

## 使用方法

### 推奨実行方法（メモリ効率化対応）
大語彙データセットを扱う場合は、メモリ拡張オプション付きで実行してください：

```bash
# 推奨: メモリ拡張オプション付き
npm run search

# または直接実行
node --max-old-space-size=8192 src/app.js search articles.txt "検索クエリ" 5
```

### 基本的な検索実行
```bash
# TF-IDF Ultra検索（推奨）
node src/app.js search data.txt "Python機械学習" 5

# 検索結果例
🎯 ======== 検索結果 ========
[1件目] 🎯 類似度: 0.0453
📄 テキスト: AI時代に「本の虫」再燃？...

📊 ======= パフォーマンス情報 =======
⏱️  実行時間: 3456ms
📚 語彙サイズ: 149598
🎯 ヒット件数: 6/82
⚙️  前処理時間: 3239ms
```

### 利用可能なアルゴリズム
```bash
# 各種アルゴリズムの比較
node src/app.js search data.txt "クエリ" 5

# 利用可能なアルゴリズム:
# - tfidf_ultra    (推奨: 最高精度、日本語最適化)
# - tfidf_advanced (高精度、重み付け対応)
# - tfidf_basic    (基本TF-IDF)
# - jaccard        (Jaccard係数)
# - simple         (単純部分一致)
```

## 技術的な詳細

### メモリ効率化
```javascript
// スパースベクトル実装例
const sparseVector = new Map();
for (const token in tf) {
    if (tf[token] > 0) {
        const tfidfValue = tf[token] * idf[token];
        if (tfidfValue > 0) {
            sparseVector.set(token, tfidfValue);
        }
    }
}
```

### パフォーマンス比較
| 項目 | 修正前 | 修正後 | 改善率 |
|------|--------|--------|--------|
| IDF計算 | O(n²) | O(n) | 大幅改善 |
| 処理時間 | 20秒+ | 3秒 | 85%短縮 |
| メモリ使用量 | 100MB | 10MB | 90%削減 |
| 語彙サイズ | 制限あり | 149,598語 | 大幅拡張 |

### Node.js設定
```json
{
  "scripts": {
    "search": "node --max-old-space-size=8192 src/app.js search"
  }
}
```

## トラブルシューティング

### メモリ不足エラー
```
FATAL ERROR: JavaScript heap out of memory
```
**解決策**: 
1. `npm run search` を使用
2. または `--max-old-space-size=8192` オプション付きで実行

### 大語彙データセット
- 149,598語以上の場合は、語彙フィルタリングを検討
- 極低頻度語（df=1）の除去でメモリ使用量をさらに削減可能

## 機能一覧

### 🔍 検索エンジン
- **TF-IDF Ultra**: 日本語N-gram + 重み付け + L2正規化
- **スパースベクトル**: 大語彙対応のメモリ効率化
- **多言語対応**: 日本語・英語混在テキストの高精度処理
- **リアルタイム進捗**: 処理状況とメモリ使用量の可視化

### 🧮 アルゴリズム詳細
- **前処理**: 文字正規化、ストップワード除去
- **トークン化**: 
  - 英単語抽出（重み1.2〜1.5）
  - カタカナ語抽出（重み1.5〜2.0）
  - 漢字列抽出（意味単位）
  - 日本語N-gram（2-4文字）
- **TF-IDF計算**: 
  - Smooth IDF: log((N+1)/(df+1))+1
  - Log TF正規化
  - L2ベクトル正規化
- **類似度**: コサイン類似度（スパースベクトル対応）

### 📊 パフォーマンス仕様
- **語彙サイズ**: 149,598語まで対応
- **文書数**: 82件（拡張可能）
- **メモリ使用量**: 約10MB（スパースベクトル）
- **処理時間**: 3-4秒（大語彙データセット）

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
