import Typo from 'typo-js';
import natural from 'natural';

export interface EnhancedMisspelling {
  word: string;
  context: string;
  suggestions: string[];
  position: number;
  sentence: string;
  language: string;
  confidence: number;
  type: 'spelling' | 'grammar' | 'context';
  severity: 'high' | 'medium' | 'low';
  rule?: string;
}

export interface SpellCheckResult {
  misspellings: EnhancedMisspelling[];
  totalWords: number;
  misspelledWords: number;
  accuracyPercentage: number;
  detectedLanguage: string;
  suggestions: Record<string, {
    word: string;
    suggestions: string[];
    count: number;
    contexts: string[];
    confidence: number;
  }>;
}

export class EnhancedSpellChecker {
  private typoCheckers: Map<string, any> = new Map();
  private dictionaries: Map<string, Set<string>> = new Map();
  private commonWords: Map<string, Set<string>> = new Map();
  private grammarRules: Map<string, Array<{pattern: RegExp, message: string, suggestion: string, severity: 'high' | 'medium' | 'low'}>> = new Map();

  constructor() {
    this.initializeDictionaries();
    this.initializeGrammarRules();
  }

  private initializeDictionaries() {
    // English dictionary
    const englishWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
      'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
      'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
      'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
      'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
      'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
      'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'water', 'been',
      'call', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'him',
      'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let',
      'put', 'say', 'she', 'too', 'use', 'was', 'win', 'you', 'big', 'but', 'can', 'car', 'cut', 'end',
      'far', 'few', 'got', 'had', 'has', 'her', 'him', 'his', 'how', 'its', 'let', 'may', 'new', 'not',
      'now', 'old', 'our', 'out', 'own', 'put', 'run', 'say', 'she', 'sit', 'the', 'too', 'top', 'try',
      'two', 'use', 'was', 'way', 'who', 'why', 'win', 'yes', 'yet', 'you', 'able', 'back', 'ball',
      'bear', 'beat', 'been', 'best', 'blue', 'boat', 'body', 'book', 'both', 'boys', 'bring', 'build',
      'call', 'came', 'care', 'carry', 'case', 'city', 'clean', 'clear', 'close', 'cold', 'come',
      'cool', 'copy', 'cost', 'could', 'cut', 'dark', 'deep', 'does', 'done', 'door', 'down', 'draw',
      'drive', 'drop', 'dry', 'each', 'early', 'earth', 'easy', 'eat', 'else', 'end', 'even', 'ever',
      'every', 'eye', 'face', 'fact', 'fall', 'family', 'far', 'fast', 'feel', 'feet', 'few', 'field',
      'find', 'fire', 'first', 'fish', 'five', 'fly', 'food', 'foot', 'form', 'found', 'four', 'free',
      'from', 'full', 'game', 'gave', 'girl', 'give', 'glass', 'goes', 'gold', 'gone', 'good', 'got',
      'great', 'green', 'ground', 'group', 'grow', 'had', 'half', 'hand', 'hard', 'head', 'hear',
      'heard', 'help', 'here', 'high', 'hold', 'home', 'hope', 'hot', 'hour', 'house', 'idea', 'important',
      'inside', 'job', 'keep', 'kind', 'know', 'land', 'large', 'last', 'late', 'learn', 'leave',
      'left', 'less', 'let', 'life', 'light', 'line', 'list', 'little', 'live', 'long', 'look',
      'lot', 'love', 'low', 'made', 'make', 'man', 'many', 'may', 'mean', 'men', 'might', 'mind',
      'miss', 'money', 'more', 'most', 'move', 'much', 'music', 'must', 'name', 'near', 'need',
      'never', 'night', 'number', 'often', 'open', 'order', 'other', 'over', 'own', 'page', 'paper',
      'part', 'people', 'picture', 'place', 'play', 'point', 'power', 'problem', 'program', 'put',
      'question', 'quick', 'quite', 'read', 'real', 'really', 'red', 'remember', 'rest', 'right',
      'room', 'round', 'run', 'said', 'same', 'saw', 'school', 'sea', 'second', 'seem', 'seen',
      'send', 'set', 'several', 'shall', 'short', 'should', 'show', 'side', 'simple', 'since',
      'small', 'so', 'social', 'some', 'something', 'sound', 'special', 'start', 'state', 'still',
      'stop', 'story', 'study', 'such', 'sure', 'system', 'table', 'take', 'talk', 'tell', 'than',
      'that', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this', 'those',
      'though', 'three', 'through', 'time', 'today', 'together', 'told', 'took', 'top', 'toward',
      'tree', 'true', 'try', 'turn', 'under', 'until', 'upon', 'used', 'using', 'very', 'voice',
      'want', 'war', 'watch', 'water', 'week', 'well', 'went', 'were', 'what', 'when', 'where',
      'which', 'while', 'white', 'whole', 'why', 'will', 'with', 'within', 'without', 'word',
      'work', 'world', 'would', 'write', 'year', 'years', 'young', 'your'
    ]);

    this.dictionaries.set('en', englishWords);
    this.commonWords.set('en', englishWords);

    // Add more languages as needed
    const spanishWords = new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'te', 'lo', 'le', 'da', 'su',
      'por', 'son', 'con', 'para', 'al', 'del', 'los', 'una', 'pero', 'las', 'todo', 'bien', 'fue',
      'esta', 'muy', 'hasta', 'desde', 'está', 'mi', 'porque', 'qué', 'sólo', 'han', 'yo', 'hay',
      'vez', 'puede', 'todos', 'así', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'mucho',
      'sea', 'ella', 'ahora', 'algo', 'aquí', 'mí', 'después', 'vida', 'poco', 'han', 'tiempo'
    ]);

    this.dictionaries.set('es', spanishWords);
    this.commonWords.set('es', spanishWords);
  }

  private initializeGrammarRules() {
    const englishRules = [
      {
        pattern: /\b(your)\s+(going|coming|doing|running|walking)\b/gi,
        message: "Should be 'you're' (you are)",
        suggestion: "you're",
        severity: 'high' as const
      },
      {
        pattern: /\b(its)\s+(a|an|the|very|really|quite)\b/gi,
        message: "Should be 'it's' (it is)",
        suggestion: "it's",
        severity: 'high' as const
      },
      {
        pattern: /\b(there)\s+(going|coming|doing|running|walking)\b/gi,
        message: "Should be 'they're' (they are)",
        suggestion: "they're",
        severity: 'high' as const
      },
      {
        pattern: /\b(could|should|would)\s+of\b/gi,
        message: "Should be 'have' not 'of'",
        suggestion: "have",
        severity: 'high' as const
      },
      {
        pattern: /\b(alot)\b/gi,
        message: "Should be two words",
        suggestion: "a lot",
        severity: 'medium' as const
      },
      {
        pattern: /\b(loose)\s+(weight|money|time|game)\b/gi,
        message: "Should be 'lose' (verb)",
        suggestion: "lose",
        severity: 'medium' as const
      },
      {
        pattern: /\b(affect)\s+(on)\b/gi,
        message: "Should be 'effect on' (noun)",
        suggestion: "effect",
        severity: 'medium' as const
      },
      {
        pattern: /\b(then)\s+(I|you|he|she|we|they)\s+(am|are|is|was|were)\b/gi,
        message: "Should be 'than' for comparison",
        suggestion: "than",
        severity: 'medium' as const
      },
      {
        pattern: /\b(definately)\b/gi,
        message: "Misspelled word",
        suggestion: "definitely",
        severity: 'high' as const
      },
      {
        pattern: /\b(recieve)\b/gi,
        message: "Misspelled word",
        suggestion: "receive",
        severity: 'high' as const
      },
      {
        pattern: /\b(seperate)\b/gi,
        message: "Misspelled word",
        suggestion: "separate",
        severity: 'high' as const
      },
      {
        pattern: /\b(occured)\b/gi,
        message: "Misspelled word",
        suggestion: "occurred",
        severity: 'high' as const
      },
      {
        pattern: /\b(begining)\b/gi,
        message: "Misspelled word",
        suggestion: "beginning",
        severity: 'high' as const
      },
      {
        pattern: /\b(accomodate)\b/gi,
        message: "Misspelled word",
        suggestion: "accommodate",
        severity: 'high' as const
      },
      {
        pattern: /\b(neccessary)\b/gi,
        message: "Misspelled word",
        suggestion: "necessary",
        severity: 'high' as const
      },
      {
        pattern: /\b(existance)\b/gi,
        message: "Misspelled word",
        suggestion: "existence",
        severity: 'high' as const
      },
      {
        pattern: /\b(maintainance)\b/gi,
        message: "Misspelled word",
        suggestion: "maintenance",
        severity: 'high' as const
      },
      {
        pattern: /\b(independant)\b/gi,
        message: "Misspelled word",
        suggestion: "independent",
        severity: 'high' as const
      }
    ];

    this.grammarRules.set('en', englishRules);
  }

  public detectLanguage(text: string): string {
    const words = this.extractWords(text);
    const scores: Record<string, number> = {};

    // Initialize scores
    this.commonWords.forEach((wordSet, lang) => {
      scores[lang] = 0;
    });

    // Count matches for each language
    words.forEach(word => {
      this.commonWords.forEach((wordSet, lang) => {
        if (wordSet.has(word.toLowerCase())) {
          scores[lang]++;
        }
      });
    });

    // Find language with highest score
    let detectedLang = 'en';
    let maxScore = 0;
    
    Object.entries(scores).forEach(([lang, score]) => {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    });

    return detectedLang;
  }

  public async checkSpelling(text: string, language: string = 'en'): Promise<SpellCheckResult> {
    const detectedLanguage = this.detectLanguage(text);
    const lang = language || detectedLanguage;
    
    const words = this.extractWords(text);
    const sentences = this.extractSentences(text);
    const misspellings: EnhancedMisspelling[] = [];
    const suggestionMap: Record<string, {
      word: string;
      suggestions: string[];
      count: number;
      contexts: string[];
      confidence: number;
    }> = {};

    // Check spelling for each word
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordLower = word.toLowerCase();
      
      // Skip if it's a common word, number, or very short
      if (this.isValidWord(wordLower, lang) || this.isNumber(word) || word.length < 3) {
        continue;
      }

      // Check if word is misspelled
      const isCorrect = this.isWordCorrect(wordLower, lang);
      
      if (!isCorrect) {
        const suggestions = this.generateSuggestions(wordLower, lang);
        const context = this.getWordContext(text, word, i);
        const sentence = this.findContainingSentence(sentences, word);
        const position = text.toLowerCase().indexOf(wordLower);
        
        const confidence = this.calculateConfidence(word, suggestions);
        
        const misspelling: EnhancedMisspelling = {
          word,
          context,
          suggestions,
          position,
          sentence,
          language: lang,
          confidence,
          type: 'spelling',
          severity: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low'
        };

        misspellings.push(misspelling);

        // Add to suggestion map
        if (!suggestionMap[wordLower]) {
          suggestionMap[wordLower] = {
            word,
            suggestions,
            count: 1,
            contexts: [context],
            confidence
          };
        } else {
          suggestionMap[wordLower].count++;
          suggestionMap[wordLower].contexts.push(context);
        }
      }
    }

    // Check grammar rules
    const grammarErrors = this.checkGrammar(text, lang);
    misspellings.push(...grammarErrors);

    const totalWords = words.length;
    const misspelledWords = misspellings.length;
    const accuracyPercentage = totalWords > 0 ? Math.round(((totalWords - misspelledWords) / totalWords) * 100) : 100;

    return {
      misspellings,
      totalWords,
      misspelledWords,
      accuracyPercentage,
      detectedLanguage: lang,
      suggestions: suggestionMap
    };
  }

  private extractWords(text: string): string[] {
    return text.match(/\b[a-zA-ZÀ-ÿ]+\b/g) || [];
  }

  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private isValidWord(word: string, language: string): boolean {
    const dictionary = this.dictionaries.get(language);
    return dictionary ? dictionary.has(word) : false;
  }

  private isNumber(word: string): boolean {
    return /^\d+$/.test(word);
  }

  private isWordCorrect(word: string, language: string): boolean {
    // Check against dictionary
    if (this.isValidWord(word, language)) {
      return true;
    }

    // Check common variations (plurals, past tense, etc.)
    const variations = this.generateWordVariations(word);
    for (const variation of variations) {
      if (this.isValidWord(variation, language)) {
        return true;
      }
    }

    // Check if it's a proper noun (capitalized)
    if (word[0] === word[0].toUpperCase() && word.length > 2) {
      return true;
    }

    return false;
  }

  private generateWordVariations(word: string): string[] {
    const variations: string[] = [];
    
    // Remove common suffixes
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'sion'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix)) {
        variations.push(word.slice(0, -suffix.length));
      }
    }

    // Add common suffixes
    variations.push(word + 's');
    variations.push(word + 'es');
    variations.push(word + 'ed');
    variations.push(word + 'ing');

    return variations;
  }

  private generateSuggestions(word: string, language: string): string[] {
    const suggestions: string[] = [];
    const dictionary = this.dictionaries.get(language);
    
    if (!dictionary) return suggestions;

    // Calculate edit distance for all dictionary words
    const candidates: Array<{word: string, distance: number}> = [];
    
    dictionary.forEach(dictWord => {
      if (Math.abs(dictWord.length - word.length) <= 2) {
        const distance = this.calculateEditDistance(word, dictWord);
        if (distance <= 2) {
          candidates.push({word: dictWord, distance});
        }
      }
    });

    // Sort by edit distance and return top suggestions
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates.slice(0, 5).map(c => c.word);
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getWordContext(text: string, word: string, wordIndex: number): string {
    const words = this.extractWords(text);
    const start = Math.max(0, wordIndex - 3);
    const end = Math.min(words.length, wordIndex + 4);
    return words.slice(start, end).join(' ');
  }

  private findContainingSentence(sentences: string[], word: string): string {
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(word.toLowerCase())) {
        return sentence.trim();
      }
    }
    return '';
  }

  private calculateConfidence(word: string, suggestions: string[]): number {
    if (suggestions.length === 0) return 0.3;
    
    const bestSuggestion = suggestions[0];
    const editDistance = this.calculateEditDistance(word.toLowerCase(), bestSuggestion.toLowerCase());
    
    // Higher confidence for smaller edit distances
    return Math.max(0.1, 1 - (editDistance / Math.max(word.length, bestSuggestion.length)));
  }

  private checkGrammar(text: string, language: string): EnhancedMisspelling[] {
    const grammarErrors: EnhancedMisspelling[] = [];
    const rules = this.grammarRules.get(language) || [];
    
    rules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        const context = this.getContextAroundPosition(text, match.index, 50);
        const sentence = this.getSentenceContainingPosition(text, match.index);
        
        grammarErrors.push({
          word: match[0],
          context,
          suggestions: [rule.suggestion],
          position: match.index,
          sentence,
          language,
          confidence: 0.9,
          type: 'grammar',
          severity: rule.severity,
          rule: rule.message
        });
      }
    });
    
    return grammarErrors;
  }

  private getContextAroundPosition(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  private getSentenceContainingPosition(text: string, position: number): string {
    const sentences = text.split(/[.!?]+/);
    let currentPos = 0;
    
    for (const sentence of sentences) {
      if (currentPos + sentence.length >= position) {
        return sentence.trim();
      }
      currentPos += sentence.length + 1;
    }
    
    return '';
  }

  public calculateReadabilityScore(text: string): number {
    const sentences = this.extractSentences(text);
    const words = this.extractWords(text);
    const syllables = words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}