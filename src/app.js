#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ========== ストップワード定義 ==========
const STOPWORDS_JP = new Set([
    'の', 'に', 'は', 'を', 'が', 'で', 'て', 'と', 'だ', 'である', 'です', 'ます',
    'から', 'まで', 'より', 'など', 'また', 'ただし', 'しかし', 'そして', 'それ', 'これ'
]);

const STOPWORDS_EN = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did'
]);

// CLI引数処理
function handleInput(args) {
    if (args.length === 0) {
        showHelp();
        return;
    }

    const command = args[0];
    
    switch (command) {
        case 'search':
            if (args.length < 3) {
                console.error('使用方法: node src/app.js search <ファイルパス> <クエリ> [件数]');
                return;
            }
            performSearch(args[1], args[2], 'tfidf_ultra', parseInt(args[3]) || 5);
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            console.error(`未知のコマンド: ${command}`);
            showHelp();
    }
}

// ヘルプ表示
function showHelp() {
    console.log('🔍 RAG CLI System - 高精度文書検索システム');
    console.log('');
    console.log('使用方法:');
    console.log('  node src/app.js search <ファイルパス> <クエリ> [件数]');
    console.log('');
    console.log('パラメータ:');
    console.log('  ファイルパス  - 検索対象の文書ファイル');
    console.log('  クエリ        - 検索したい文字列');
    console.log('  件数          - 表示する検索結果の数（デフォルト: 5）');
    console.log('');
    console.log('コマンド:');
    console.log('  search    - TF-IDF（Ultra）アルゴリズムで文書検索を実行');
    console.log('  help      - このヘルプを表示');
    console.log('');
    console.log('例:');
    console.log('  node src/app.js search data.txt "Python機械学習" 5');
    console.log('  node src/app.js search ../data.txt "ライブラリを用いたPython"');
}

// ========== 前処理関数 ==========
function preprocessTextAdvanced(text) {
    console.log('🔄 前処理開始...');
    console.log(`📝 元テキスト長: ${text.length}文字`);
    
    const cleaned = text.replace(/[^a-zA-Z0-9ぁ-んァ-ヶヷ-ヺー一-龥、。！？\s.,!?]/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
    
    console.log(`✅ 前処理完了: ${cleaned.length}文字`);
    return cleaned;
}

// ========== トークン化関数 ==========
function getTokensAdvanced(text, options = {}) {
    console.log('🔧 高精度トークン化開始...');
    
    const {
        useStopwords = true,
        katakanaWeight = 1.5,
        englishWeight = 1.2
    } = options;
    
    const clean = preprocessTextAdvanced(text);
    const tokens = [];
    
    // 英単語（ストップワード除去オプション）
    const englishWords = clean.match(/\b[a-zA-Z]{2,}\b/g) || [];
    console.log(`📝 英単語抽出: ${englishWords.length}個`);
    
    englishWords.forEach(word => {
        const lower = word.toLowerCase();
        if (!useStopwords || !STOPWORDS_EN.has(lower)) {
            // 英語重み適用
            for (let i = 0; i < Math.round(englishWeight); i++) {
                tokens.push(lower);
            }
        }
    });
    
    // 数字（年号、バージョン等重要）
    const numbers = clean.match(/\d+/g) || [];
    console.log(`🔢 数字抽出: ${numbers.length}個`);
    tokens.push(...numbers);
    
    // カタカナ語（技術用語として重要度高）
    const katakanaWords = clean.match(/[ァ-ヶー]{2,}/g) || [];
    console.log(`🈯 カタカナ語抽出: ${katakanaWords.length}個`);
    
    katakanaWords.forEach(word => {
        // カタカナ重み適用
        for (let i = 0; i < Math.round(katakanaWeight); i++) {
            tokens.push(word);
        }
    });
    
    // 漢字列（意味のある単語として抽出）
    const kanjiSequences = clean.match(/[一-龥]{1,}/g) || [];
    console.log(`🈴 漢字列抽出: ${kanjiSequences.length}個`);
    
    kanjiSequences.forEach(seq => {
        if (!useStopwords || !STOPWORDS_JP.has(seq)) {
            tokens.push(seq);
        }
    });
    
    // 日本語N-gram（2-4文字、重複制御）
    const japanese = clean.replace(/[a-zA-Z0-9\s.,!?、。！？]/g, '');
    let ngramCount = 0;
    
    for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= japanese.length - n; i++) {
            const ngram = japanese.substring(i, i + n);
            if (!useStopwords || !STOPWORDS_JP.has(ngram)) {
                tokens.push(ngram);
                ngramCount++;
            }
        }
    }
    
    console.log(`📊 N-gram生成: ${ngramCount}個`);
    console.log(`✅ トークン化完了: ${tokens.length}個のトークン`);
    
    return tokens;
}

function getTokensBasic(text) {
    const clean = preprocessTextAdvanced(text);
    const tokens = [];
    
    const englishWords = clean.match(/\b[a-zA-Z]+\b/g) || [];
    tokens.push(...englishWords.map(w => w.toLowerCase()));
    
    const japanese = clean.replace(/[a-zA-Z0-9\s]/g, '');
    for (let n = 2; n <= 3; n++) {
        for (let i = 0; i <= japanese.length - n; i++) {
            tokens.push(japanese.substring(i, i + n));
        }
    }
    
    return tokens;
}

// ========== TF-IDF計算 ==========
function computeTFIDFAdvanced(documents, query, tokenizerFunction, options = {}) {
    const startTime = Date.now();
    console.log('🧮 TF-IDF計算開始...');
    
    const useL2Norm = options.useL2Norm !== false;
    const useImprovedIDF = options.useImprovedIDF !== false;
    
    console.log(`📊 設定: L2正規化=${useL2Norm}, 改良IDF=${useImprovedIDF}`);
    
    // 全文書とクエリのトークン化
    console.log('🔤 全文書のトークン化中...');
    const allTexts = [...documents, query];
    const allTokens = allTexts.map((text, index) => {
        if (index === allTexts.length - 1) {
            console.log('🔍 クエリのトークン化中...');
        } else {
            console.log(`📄 文書${index + 1}のトークン化中...`);
        }
        return tokenizerFunction(text, options);
    });
    
    // 語彙構築
    console.log('📚 語彙構築中...');
    const vocabulary = [...new Set(allTokens.flat())];
    const vocabSize = vocabulary.length;
    console.log(`✅ 語彙サイズ: ${vocabSize}`);
    
    // TF計算
    console.log('📈 TF値計算中...');
    const tfidfVectors = allTokens.map((tokens, index) => {
        const tf = {};
        const totalTokens = tokens.length;
        
        console.log(`  文書${index + 1}: ${totalTokens}トークン`);
        
        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });
        
        // TF正規化
        Object.keys(tf).forEach(token => {
            tf[token] = useImprovedIDF ? 
                Math.log(1 + tf[token]) : // Log TF
                tf[token] / totalTokens;   // Raw TF
        });
        
        return tf;
    });
    
    // IDF計算
    console.log('📉 IDF値計算中...');
    const idf = {};
    const docCount = allTexts.length;
    let processedTerms = 0;
    
    // 最適化：Map を使用してDocumentFrequencyを計算
    const documentFrequency = new Map();
    
    console.log('  文書頻度計算中...');
    allTokens.forEach((tokens, docIndex) => {
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach(token => {
            documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
        });
        
        if (docIndex % 10 === 0) {
            console.log(`    文書進行状況: ${docIndex + 1}/${allTokens.length}`);
        }
    });
    
    console.log('  IDF値計算中...');
    vocabulary.forEach((token, index) => {
        const df = documentFrequency.get(token) || 1;
        
        if (useImprovedIDF) {
            // Smooth IDF: log((N + 1) / (df + 1)) + 1
            idf[token] = Math.log((docCount + 1) / (df + 1)) + 1;
        } else {
            // Standard IDF
            idf[token] = Math.log(docCount / df);
        }
        
        processedTerms++;
        if (processedTerms % 15000 === 0) {
            console.log(`    語彙進行状況: ${processedTerms}/${vocabulary.length}語 (${(processedTerms/vocabulary.length*100).toFixed(1)}%)`);
        }
    });
    
    console.log('✅ IDF値計算完了');
    
    // TF-IDFベクトル作成（メモリ効率化）
    console.log('🔢 TF-IDFベクトル作成中...');
    const vectors = [];
    
    for (let docIndex = 0; docIndex < tfidfVectors.length; docIndex++) {
        const tf = tfidfVectors[docIndex];
        console.log(`  文書${docIndex + 1}/${tfidfVectors.length}のベクトル作成中...`);
        
        // スパースベクトル形式で作成（0でない値のみ保持）
        const sparseVector = new Map();
        let magnitude = 0;
        
        // 非零要素のみ計算
        for (const token in tf) {
            if (tf[token] > 0) {
                const tfidfValue = tf[token] * idf[token];
                if (tfidfValue > 0) {
                    sparseVector.set(token, tfidfValue);
                    magnitude += tfidfValue * tfidfValue;
                }
            }
        }
        
        // L2正規化
        if (useL2Norm && magnitude > 0) {
            magnitude = Math.sqrt(magnitude);
            for (const [token, value] of sparseVector) {
                sparseVector.set(token, value / magnitude);
            }
        }
        
        vectors.push(sparseVector);
        
        // メモリ使用量を定期的に報告
        if (docIndex % 10 === 0) {
            const memUsage = process.memoryUsage();
            console.log(`    メモリ使用量: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(1)}MB`);
        }
    }
    
    const preprocessingTime = Date.now() - startTime;
    console.log(`✅ TF-IDF計算完了: ${preprocessingTime}ms`);
    
    return {
        vectors: vectors,
        vocabulary: vocabulary,
        vocabSize: vocabSize,
        preprocessingTime: preprocessingTime,
        queryVector: vectors[vectors.length - 1],
        docVectors: vectors.slice(0, -1),
        isSparse: true  // スパースベクトルフラグ
    };
}

// ========== 類似度計算（スパースベクトル対応） ==========
function cosineSimilarityAdvanced(vec1, vec2) {
    // スパースベクトルの場合
    if (vec1 instanceof Map && vec2 instanceof Map) {
        let dotProduct = 0;
        
        // 小さい方のベクトルでループして効率化
        const [smaller, larger] = vec1.size <= vec2.size ? [vec1, vec2] : [vec2, vec1];
        
        for (const [token, value1] of smaller) {
            const value2 = larger.get(token);
            if (value2 !== undefined) {
                dotProduct += value1 * value2;
            }
        }
        
        return dotProduct; // 既にL2正規化済みなので内積が類似度
    }
    
    // 従来の密ベクトルの場合
    return vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
}

function jaccardSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

// ========== 検索関数 ==========
function searchJaccard(documents, query, topN) {
    const startTime = Date.now();
    
    const queryTokens = getTokensBasic(query);
    const results = [];
    
    documents.forEach((doc, index) => {
        const docTokens = getTokensBasic(doc.text);
        const similarity = jaccardSimilarity(queryTokens, docTokens);
        
        if (similarity > 0) {
            results.push({
                index: index + 1,
                similarity: similarity,
                text: doc.text
            });
        }
    });
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: 'Jaccard係数',
        vocabSize: new Set(queryTokens).size,
        preprocessingTime: 0
    };
}

function searchTFIDF(documents, query, topN, tokenizerFunction, algorithmName, useAdvanced = false, options = {}) {
    const startTime = Date.now();
    console.log(`🎯 ${algorithmName} 検索開始...`);
    
    const docTexts = documents.map(doc => doc.text);
    console.log(`📄 対象文書数: ${docTexts.length}`);
    
    const tfidfData = computeTFIDFAdvanced(docTexts, query, tokenizerFunction, options);
    
    const results = [];
    console.log('🔍 類似度計算中...');
    
    tfidfData.docVectors.forEach((docVector, index) => {
        const similarity = cosineSimilarityAdvanced(tfidfData.queryVector, docVector);
        
        console.log(`  文書${index + 1}: 類似度 ${similarity.toFixed(4)}`);
        
        if (similarity > 0.001) {  // 極小値フィルタリング
            results.push({
                index: index + 1,
                similarity: similarity,
                text: documents[index].text
            });
        }
    });
    
    results.sort((a, b) => b.similarity - a.similarity);
    console.log(`✅ 検索完了: ${results.length}件のヒット`);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: algorithmName,
        vocabSize: tfidfData.vocabSize,
        preprocessingTime: tfidfData.preprocessingTime
    };
}

// 簡易検索（従来の実装）
function performSimpleSearch(documents, query, topN) {
    const startTime = Date.now();
    const results = [];
    
    documents.forEach((doc, index) => {
        const similarity = calculateSimilarity(doc.text, query);
        if (similarity > 0) {
            results.push({
                index: index + 1,
                similarity: similarity,
                text: doc.text
            });
        }
    });

    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: '単純部分一致',
        vocabSize: query.split(/\s+/).length,
        preprocessingTime: 0
    };
}

// 簡易類似度計算（部分一致ベース）
function calculateSimilarity(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // 完全一致
    if (textLower.includes(queryLower)) {
        return 1.0;
    }
    
    // 単語単位での一致度
    const textWords = textLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    let matches = 0;
    
    queryWords.forEach(queryWord => {
        if (textWords.some(textWord => textWord.includes(queryWord))) {
            matches++;
        }
    });
    
    return queryWords.length > 0 ? matches / queryWords.length : 0;
}

// ========== メイン検索実装 ==========
function performSearch(filePath, query, algorithm = 'tfidf_ultra', topN = 5) {
    try {
        // ファイル存在確認
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ファイルが見つかりません: ${filePath}`);
            return;
        }

        // ファイル読み込み
        console.log(`📂 ファイル読み込み開始: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const documents = fileContent.split('\n')
            .filter(line => line.trim())
            .map(line => ({ text: line }));

        if (documents.length === 0) {
            console.error('❌ ファイルにデータが見つかりません');
            return;
        }

        console.log(`📁 ファイル読み込み完了: ${documents.length}件の文書`);
        console.log(`🔍 検索クエリ: "${query}"`);
        console.log(`⚙️  アルゴリズム: ${algorithm}`);
        console.log(`📊 上位${topN}件を表示`);
        console.log('');

        // アルゴリズム選択
        let searchResult;
        console.log('🚀 検索アルゴリズム実行中...');
        
        switch (algorithm) {
            case 'simple':
                console.log('🔍 簡易検索を実行中...');
                searchResult = performSimpleSearch(documents, query, topN);
                break;
            case 'jaccard':
                console.log('🔍 Jaccard係数検索を実行中...');
                searchResult = searchJaccard(documents, query, topN);
                break;
            case 'tfidf_basic':
                console.log('🔍 TF-IDF基本検索を実行中...');
                searchResult = searchTFIDF(documents, query, topN, getTokensBasic, 'TF-IDF（基本）', false);
                break;
            case 'tfidf_advanced':
                console.log('🔍 TF-IDF高精度検索を実行中...');
                searchResult = searchTFIDF(documents, query, topN, getTokensAdvanced, 'TF-IDF（高精度）', true, {
                    useStopwords: true,
                    katakanaWeight: 1.5,
                    englishWeight: 1.2
                });
                break;
            case 'tfidf_ultra':
                console.log('🔍 TF-IDF Ultra検索を実行中...');
                searchResult = searchTFIDF(documents, query, topN, getTokensAdvanced, 'TF-IDF（Ultra）', true, {
                    useStopwords: true,
                    katakanaWeight: 2.0,
                    englishWeight: 1.5,
                    useL2Norm: true,
                    useImprovedIDF: true
                });
                break;
            default:
                console.error(`❌ 無効なアルゴリズム: ${algorithm}`);
                return;
        }

        // 結果表示
        console.log('🎯 ======== 検索結果 ========');
        if (searchResult.results.length === 0) {
            console.log('❌ 検索結果が見つかりませんでした');
        } else {
            searchResult.results.forEach((result, index) => {
                console.log(`[${index + 1}件目] 🎯 類似度: ${result.similarity.toFixed(4)}`);
                console.log(`📄 テキスト: ${result.text}`);
                console.log('');
            });
        }
        
        console.log('📊 ======= パフォーマンス情報 =======');
        console.log(`⏱️  実行時間: ${searchResult.executionTime}ms`);
        console.log(`📚 語彙サイズ: ${searchResult.vocabSize}`);
        console.log(`🎯 ヒット件数: ${searchResult.results.length}/${documents.length}`);
        if (searchResult.preprocessingTime) {
            console.log(`⚙️  前処理時間: ${searchResult.preprocessingTime}ms`);
        }
        console.log('=====================================');

    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }
}

// メイン関数
function main() {
    const args = process.argv.slice(2);
    handleInput(args);
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = { handleInput, performSearch };