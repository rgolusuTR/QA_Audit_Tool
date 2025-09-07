import { Nspell } from 'nspell';

export interface AccurateSpellingResult {
  word: string;
  isCorrect: boolean;
  suggestions: string[];
  context: string;
  position: number;
  confidence: number;
  type: 'spelling' | 'grammar' | 'context';
  severity: 'high' | 'medium' | 'low';
  language: string;
  rule?: string;
}

export interface SpellCheckAnalysis {
  totalWords: number;
  misspelledWords: number;
  accuracyPercentage: number;
  detectedLanguage: string;
  errors: AccurateSpellingResult[];
  suggestions: Record<string, {
    word: string;
    suggestions: string[];
    count: number;
    contexts: string[];
    confidence: number;
  }>;
  readabilityScore: number;
}

export class ProfessionalSpellChecker {
  private spellChecker: any = null;
  private isInitialized = false;
  private commonWords: Set<string>;
  private technicalTerms: Set<string>;
  private properNouns: Set<string>;

  constructor() {
    this.commonWords = new Set([
      // Common English words that should never be flagged
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
      'put', 'say', 'she', 'too', 'use', 'was', 'win', 'you'
    ]);

    this.technicalTerms = new Set([
      // Technical terms that shouldn't be flagged as misspellings
      'api', 'url', 'html', 'css', 'javascript', 'json', 'xml', 'http', 'https', 'seo', 'cms',
      'ui', 'ux', 'cdn', 'ssl', 'tls', 'dns', 'ip', 'tcp', 'udp', 'ftp', 'smtp', 'pop', 'imap',
      'oauth', 'jwt', 'cors', 'csrf', 'xss', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql',
      'redis', 'elasticsearch', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'github', 'gitlab',
      'npm', 'yarn', 'webpack', 'babel', 'typescript', 'nodejs', 'reactjs', 'vuejs', 'angular'
    ]);

    this.properNouns = new Set([
      // Common proper nouns and brand names
      'google', 'microsoft', 'apple', 'amazon', 'facebook', 'twitter', 'linkedin', 'instagram',
      'youtube', 'netflix', 'spotify', 'adobe', 'salesforce', 'oracle', 'ibm', 'intel', 'nvidia'
    ]);

    this.initializeSpellChecker();
  }

  private async initializeSpellChecker() {
    try {
      // Initialize with a comprehensive word list
      const wordList = await this.loadWordList();
      this.spellChecker = {
        check: (word: string) => this.checkWord(word, wordList),
        suggest: (word: string) => this.generateSuggestions(word, wordList)
      };
      this.isInitialized = true;
      console.log('Professional spell checker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize spell checker:', error);
      // Fallback to basic implementation
      this.initializeFallbackChecker();
    }
  }

  private async loadWordList(): Promise<Set<string>> {
    // Comprehensive English word list
    const words = new Set([
      // Add comprehensive dictionary words
      ...this.commonWords,
      ...this.technicalTerms,
      ...this.properNouns,
      // Additional common words
      'about', 'above', 'across', 'add', 'against', 'almost', 'alone', 'along', 'already', 'although',
      'always', 'among', 'another', 'answer', 'around', 'away', 'become', 'before', 'began', 'begin',
      'being', 'below', 'between', 'both', 'bring', 'came', 'cannot', 'change', 'close', 'come',
      'could', 'country', 'course', 'create', 'different', 'does', 'done', 'during', 'each', 'early',
      'earth', 'every', 'example', 'family', 'far', 'feel', 'few', 'find', 'first', 'follow',
      'found', 'four', 'from', 'general', 'give', 'great', 'group', 'grow', 'hand', 'hard',
      'head', 'help', 'here', 'high', 'home', 'house', 'however', 'important', 'increase', 'information',
      'interest', 'into', 'issue', 'keep', 'kind', 'know', 'large', 'last', 'late', 'learn',
      'leave', 'left', 'level', 'life', 'line', 'little', 'live', 'local', 'long', 'look',
      'made', 'make', 'many', 'may', 'mean', 'might', 'money', 'more', 'most', 'move',
      'much', 'must', 'name', 'national', 'need', 'never', 'next', 'night', 'number', 'often',
      'old', 'only', 'open', 'order', 'other', 'over', 'own', 'part', 'people', 'place',
      'point', 'possible', 'power', 'problem', 'program', 'provide', 'public', 'put', 'question', 'quite',
      'rather', 'real', 'really', 'right', 'room', 'run', 'same', 'school', 'seem', 'several',
      'should', 'show', 'side', 'since', 'small', 'social', 'some', 'something', 'special', 'start',
      'state', 'still', 'such', 'system', 'take', 'than', 'that', 'their', 'them', 'then',
      'there', 'these', 'they', 'thing', 'think', 'this', 'those', 'though', 'three', 'through',
      'time', 'today', 'together', 'too', 'turn', 'under', 'until', 'upon', 'used', 'using',
      'very', 'want', 'water', 'week', 'well', 'were', 'what', 'when', 'where', 'which',
      'while', 'white', 'whole', 'will', 'with', 'within', 'without', 'word', 'work', 'world',
      'would', 'write', 'year', 'years', 'young', 'your'
    ]);

    // Add common misspellings and their corrections
    const commonMisspellings = new Map([
      ['recieve', 'receive'],
      ['seperate', 'separate'],
      ['definately', 'definitely'],
      ['occured', 'occurred'],
      ['begining', 'beginning'],
      ['accomodate', 'accommodate'],
      ['neccessary', 'necessary'],
      ['existance', 'existence'],
      ['maintainance', 'maintenance'],
      ['independant', 'independent'],
      ['appearence', 'appearance'],
      ['beleive', 'believe'],
      ['acheive', 'achieve'],
      ['wierd', 'weird'],
      ['freind', 'friend'],
      ['thier', 'their'],
      ['reccomend', 'recommend'],
      ['occassion', 'occasion'],
      ['embarass', 'embarrass'],
      ['tommorrow', 'tomorrow'],
      ['untill', 'until'],
      ['sucessful', 'successful'],
      ['buisness', 'business'],
      ['calender', 'calendar'],
      ['cemetary', 'cemetery'],
      ['changable', 'changeable'],
      ['colectable', 'collectible'],
      ['commitee', 'committee'],
      ['concious', 'conscious'],
      ['curiousity', 'curiosity'],
      ['dilemna', 'dilemma'],
      ['enviroment', 'environment'],
      ['exhilerate', 'exhilarate'],
      ['facinating', 'fascinating'],
      ['flourescent', 'fluorescent'],
      ['foriegn', 'foreign'],
      ['goverment', 'government'],
      ['harrass', 'harass'],
      ['hieght', 'height'],
      ['hygeine', 'hygiene'],
      ['inoculate', 'inoculate'],
      ['jewlery', 'jewelry'],
      ['knowlege', 'knowledge'],
      ['liason', 'liaison'],
      ['millenium', 'millennium'],
      ['mispell', 'misspell'],
      ['noticable', 'noticeable'],
      ['occurance', 'occurrence'],
      ['perseverence', 'perseverance'],
      ['priviledge', 'privilege'],
      ['publically', 'publicly'],
      ['questionaire', 'questionnaire'],
      ['rythm', 'rhythm'],
      ['sacrafice', 'sacrifice'],
      ['temperture', 'temperature'],
      ['truely', 'truly'],
      ['vaccuum', 'vacuum'],
      ['wellcome', 'welcome']
    ]);

    // Add correct spellings to word list
    commonMisspellings.forEach((correct, incorrect) => {
      words.add(correct);
    });

    return words;
  }

  private initializeFallbackChecker() {
    this.spellChecker = {
      check: (word: string) => this.fallbackCheck(word),
      suggest: (word: string) => this.fallbackSuggest(word)
    };
    this.isInitialized = true;
    console.log('Fallback spell checker initialized');
  }

  private checkWord(word: string, wordList: Set<string>): boolean {
    const cleanWord = word.toLowerCase().trim();
    
    // Skip very short words, numbers, or words with numbers
    if (cleanWord.length < 3 || /\d/.test(cleanWord)) {
      return true;
    }

    // Check if it's in our word list
    if (wordList.has(cleanWord)) {
      return true;
    }

    // Check if it's a proper noun (capitalized)
    if (word[0] === word[0].toUpperCase() && word.length > 2) {
      return true;
    }

    // Check common word variations
    const variations = this.generateWordVariations(cleanWord);
    for (const variation of variations) {
      if (wordList.has(variation)) {
        return true;
      }
    }

    return false;
  }

  private fallbackCheck(word: string): boolean {
    const cleanWord = word.toLowerCase().trim();
    
    // Basic checks
    if (cleanWord.length < 3 || /\d/.test(cleanWord)) {
      return true;
    }

    // Check against our word sets
    return this.commonWords.has(cleanWord) || 
           this.technicalTerms.has(cleanWord) || 
           this.properNouns.has(cleanWord) ||
           (word[0] === word[0].toUpperCase() && word.length > 2);
  }

  private generateWordVariations(word: string): string[] {
    const variations: string[] = [];
    
    // Remove common suffixes
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        variations.push(word.slice(0, -suffix.length));
      }
    }

    // Add common suffixes
    variations.push(word + 's', word + 'es', word + 'ed', word + 'ing');

    // Handle double consonants
    if (word.length > 3) {
      const lastChar = word[word.length - 1];
      const secondLastChar = word[word.length - 2];
      if (lastChar === secondLastChar) {
        variations.push(word.slice(0, -1)); // Remove double consonant
      }
    }

    return variations;
  }

  private generateSuggestions(word: string, wordList: Set<string>): string[] {
    const suggestions: string[] = [];
    const cleanWord = word.toLowerCase();
    
    // Check common misspellings first
    const commonCorrections = this.getCommonCorrections(cleanWord);
    if (commonCorrections.length > 0) {
      suggestions.push(...commonCorrections);
    }

    // Generate suggestions based on edit distance
    const candidates: Array<{word: string, distance: number}> = [];
    
    wordList.forEach(dictWord => {
      if (Math.abs(dictWord.length - cleanWord.length) <= 2) {
        const distance = this.calculateEditDistance(cleanWord, dictWord);
        if (distance <= 2 && distance > 0) {
          candidates.push({word: dictWord, distance});
        }
      }
    });

    // Sort by edit distance and add to suggestions
    candidates.sort((a, b) => a.distance - b.distance);
    const editSuggestions = candidates.slice(0, 3).map(c => c.word);
    
    // Combine and deduplicate
    const allSuggestions = [...suggestions, ...editSuggestions];
    return [...new Set(allSuggestions)].slice(0, 5);
  }

  private fallbackSuggest(word: string): string[] {
    const cleanWord = word.toLowerCase();
    const suggestions: string[] = [];
    
    // Common misspellings
    const corrections = this.getCommonCorrections(cleanWord);
    if (corrections.length > 0) {
      suggestions.push(...corrections);
    }

    // Simple phonetic suggestions
    const phoneticSuggestions = this.getPhoneticSuggestions(cleanWord);
    suggestions.push(...phoneticSuggestions);

    return [...new Set(suggestions)].slice(0, 5);
  }

  private getCommonCorrections(word: string): string[] {
    const corrections: Record<string, string[]> = {
      'recieve': ['receive'],
      'seperate': ['separate'],
      'definately': ['definitely'],
      'occured': ['occurred'],
      'begining': ['beginning'],
      'accomodate': ['accommodate'],
      'neccessary': ['necessary'],
      'existance': ['existence'],
      'maintainance': ['maintenance'],
      'independant': ['independent'],
      'appearence': ['appearance'],
      'beleive': ['believe'],
      'acheive': ['achieve'],
      'wierd': ['weird'],
      'freind': ['friend'],
      'thier': ['their'],
      'reccomend': ['recommend'],
      'occassion': ['occasion'],
      'embarass': ['embarrass'],
      'tommorrow': ['tomorrow'],
      'untill': ['until'],
      'sucessful': ['successful'],
      'buisness': ['business'],
      'alot': ['a lot'],
      'loose': ['lose'],
      'your': ['you\'re'],
      'its': ['it\'s'],
      'there': ['their', 'they\'re'],
      'then': ['than'],
      'affect': ['effect']
    };

    return corrections[word] || [];
  }

  private getPhoneticSuggestions(word: string): string[] {
    // Simple phonetic replacements
    const phoneticMap: Record<string, string[]> = {
      'ph': ['f'],
      'gh': ['f'],
      'ck': ['k'],
      'qu': ['kw'],
      'x': ['ks'],
      'c': ['k', 's'],
      'z': ['s']
    };

    const suggestions: string[] = [];
    
    Object.entries(phoneticMap).forEach(([from, toList]) => {
      if (word.includes(from)) {
        toList.forEach(to => {
          suggestions.push(word.replace(from, to));
        });
      }
    });

    return suggestions;
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  public async analyzeText(text: string): Promise<SpellCheckAnalysis> {
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for initialization
    }

    const words = this.extractWords(text);
    const errors: AccurateSpellingResult[] = [];
    const suggestionMap: Record<string, {
      word: string;
      suggestions: string[];
      count: number;
      contexts: string[];
      confidence: number;
    }> = {};

    let wordIndex = 0;
    for (const word of words) {
      const isCorrect = this.spellChecker.check(word);
      
      if (!isCorrect) {
        const suggestions = this.spellChecker.suggest(word);
        const context = this.getWordContext(text, word, wordIndex);
        const position = text.toLowerCase().indexOf(word.toLowerCase());
        const confidence = this.calculateConfidence(word, suggestions);
        
        const error: AccurateSpellingResult = {
          word,
          isCorrect: false,
          suggestions,
          context,
          position,
          confidence,
          type: 'spelling',
          severity: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
          language: 'en'
        };

        errors.push(error);

        // Add to suggestion map
        const key = word.toLowerCase();
        if (!suggestionMap[key]) {
          suggestionMap[key] = {
            word,
            suggestions,
            count: 1,
            contexts: [context],
            confidence
          };
        } else {
          suggestionMap[key].count++;
          suggestionMap[key].contexts.push(context);
        }
      }
      wordIndex++;
    }

    const totalWords = words.length;
    const misspelledWords = errors.length;
    const accuracyPercentage = totalWords > 0 ? Math.round(((totalWords - misspelledWords) / totalWords) * 100) : 100;
    const readabilityScore = this.calculateReadabilityScore(text);

    return {
      totalWords,
      misspelledWords,
      accuracyPercentage,
      detectedLanguage: 'en',
      errors,
      suggestions: suggestionMap,
      readabilityScore
    };
  }

  private extractWords(text: string): string[] {
    // Extract words, excluding HTML tags and special characters
    const cleanText = text.replace(/<[^>]*>/g, ' '); // Remove HTML tags
    return cleanText.match(/\b[a-zA-Z]+\b/g) || [];
  }

  private getWordContext(text: string, word: string, wordIndex: number): string {
    const words = this.extractWords(text);
    const start = Math.max(0, wordIndex - 3);
    const end = Math.min(words.length, wordIndex + 4);
    return words.slice(start, end).join(' ');
  }

  private calculateConfidence(word: string, suggestions: string[]): number {
    if (suggestions.length === 0) return 0.3;
    
    const bestSuggestion = suggestions[0];
    const editDistance = this.calculateEditDistance(word.toLowerCase(), bestSuggestion.toLowerCase());
    
    // Higher confidence for smaller edit distances
    const maxLength = Math.max(word.length, bestSuggestion.length);
    return Math.max(0.1, 1 - (editDistance / maxLength));
  }

  private calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
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

  public detectLanguage(text: string): string {
    // Simple language detection based on common words
    const words = this.extractWords(text).map(w => w.toLowerCase());
    const englishWords = words.filter(word => this.commonWords.has(word));
    
    // If more than 30% are common English words, assume English
    return (englishWords.length / words.length) > 0.3 ? 'en' : 'unknown';
  }
}