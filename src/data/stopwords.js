const STOPWORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
    'can', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 
    'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 
    'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'just', 'll', 'me', 
    'might', 'mightn\'t', 'more', 'most', 'must', 'mustn\'t', 'my', 'myself', 'needn\'t', 
    'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 
    'ours', 'ourselves', 'out', 'over', 'own', 're', 's', 'same', 'shan\'t', 'she', 'she\'d', 
    'she\'ll', 'she\'s', 'should', 'should\'ve', 'shouldn\'t', 'so', 'some', 'such', 't', 
    'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 
    'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 've', 'very', 
    'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 
    'what', 'what\'s', 'when', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 
    'whom', 'why', 'will', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 
    'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

module.exports = STOPWORDS;