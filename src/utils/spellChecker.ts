// Language detection and spell checking utilities
export class SpellChecker {
  private commonWords: Record<string, string[]> = {
    'en': [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
      'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
      'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
      'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
      'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
      'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
      'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ],
    'es': [
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'te', 'lo', 'le', 'da', 'su',
      'por', 'son', 'con', 'para', 'al', 'del', 'los', 'una', 'pero', 'las', 'todo', 'bien', 'fue',
      'esta', 'muy', 'hasta', 'desde', 'está', 'mi', 'porque', 'qué', 'sólo', 'han', 'yo', 'hay',
      'vez', 'puede', 'todos', 'así', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'mucho',
      'sea', 'ella', 'ahora', 'algo', 'aquí', 'mí', 'después', 'vida', 'poco', 'han', 'tiempo'
    ],
    'fr': [
      'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce',
      'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'il', 'me',
      'même', 'y', 'ces', 'mon', 'qui', 'lui', 'très', 'si', 'te', 'mais', 'du', 'elle', 'au',
      'de', 'ce', 'le', 'vous', 'la', 'tu', 'que', 'les', 'avec', 'son', 'me', 'dans', 'du', 'elle'
    ],
    'de': [
      'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für',
      'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus',
      'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch',
      'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor'
    ]
  };

  private commonMisspellings: Record<string, Record<string, string>> = {
    'en': {
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely',
      'occured': 'occurred',
      'begining': 'beginning',
      'accomodate': 'accommodate',
      'neccessary': 'necessary',
      'existance': 'existence',
      'maintainance': 'maintenance',
      'independant': 'independent',
      'appearence': 'appearance',
      'beleive': 'believe',
      'acheive': 'achieve',
      'wierd': 'weird',
      'freind': 'friend',
      'thier': 'their',
      'reccomend': 'recommend',
      'occassion': 'occasion',
      'embarass': 'embarrass',
      'tommorrow': 'tomorrow',
      'untill': 'until',
      'sucessful': 'successful',
      'buisness': 'business',
      'calender': 'calendar',
      'cemetary': 'cemetery',
      'changable': 'changeable',
      'colectable': 'collectible',
      'commitee': 'committee',
      'concious': 'conscious',
      'curiousity': 'curiosity',
      'dilemna': 'dilemma',
      'enviroment': 'environment',
      'exhilerate': 'exhilarate',
      'facinating': 'fascinating',
      'flourescent': 'fluorescent',
      'foriegn': 'foreign',
      'goverment': 'government',
      'harrass': 'harass',
      'hieght': 'height',
      'hygeine': 'hygiene',
      'inoculate': 'inoculate',
      'jewlery': 'jewelry',
      'knowlege': 'knowledge',
      'liason': 'liaison',
      'millenium': 'millennium',
      'mispell': 'misspell',
      'noticable': 'noticeable',
      'occurance': 'occurrence',
      'perseverence': 'perseverance',
      'priviledge': 'privilege',
      'publically': 'publicly',
      'questionaire': 'questionnaire',
      'rythm': 'rhythm',
      'sacrafice': 'sacrifice',
      'temperture': 'temperature',
      'truely': 'truly',
      'vaccuum': 'vacuum',
      'wellcome': 'welcome'
    },
    'es': {
      'haber': 'a ver',
      'aver': 'a ver',
      'echo': 'hecho',
      'asta': 'hasta',
      'asia': 'hacia',
      'ay': 'hay',
      'ahi': 'ahí',
      'tubo': 'tuvo',
      'valla': 'vaya',
      'balla': 'vaya',
      'halla': 'haya',
      'alla': 'allá',
      'serca': 'cerca',
      'acer': 'hacer',
      'ase': 'hace',
      'asiendo': 'haciendo',
      'disen': 'dicen',
      'dijistes': 'dijiste',
      'haiga': 'haya',
      'hubieron': 'hubo',
      'nadien': 'nadie',
      'onde': 'donde',
      'pos': 'pues',
      'satisfacera': 'satisfará',
      'vistes': 'viste'
    },
    'fr': {
      'apartir': 'à partir',
      'biensur': 'bien sûr',
      'malgrés': 'malgré',
      'parmis': 'parmi',
      'quelquefois': 'quelques fois',
      'tous': 'tout',
      'chaqu\'un': 'chacun',
      'language': 'langage',
      'déveloper': 'développer',
      'dévelopement': 'développement',
      'dévelopeur': 'développeur',
      'dévelopé': 'développé',
      'dévelopant': 'développant',
      'dévelopons': 'développons',
      'dévelopez': 'développez',
      'dévelopent': 'développent',
      'dévelopera': 'développera',
      'déveloperont': 'développeront',
      'déveloperai': 'développerai',
      'déveloperas': 'développeras',
      'déveloperez': 'développerez',
      'déveloperons': 'développerons'
    },
    'de': {
      'standart': 'standard',
      'wiederstand': 'widerstand',
      'rhytmus': 'rhythmus',
      'sylvester': 'silvester',
      'maschiene': 'maschine',
      'addresse': 'adresse',
      'agressiv': 'aggressiv',
      'algorhythmus': 'algorithmus',
      'brillant': 'brillant',
      'bussiness': 'business',
      'comittee': 'committee',
      'definitly': 'definitiv',
      'existance': 'existenz',
      'facinating': 'faszinierend',
      'goverment': 'regierung',
      'independant': 'unabhängig',
      'maintainance': 'wartung',
      'neccessary': 'notwendig',
      'occured': 'aufgetreten',
      'recieve': 'erhalten',
      'seperate': 'getrennt',
      'sucessful': 'erfolgreich'
    }
  };

  private grammarRules: Record<string, Array<{pattern: RegExp, message: string, suggestion: string}>> = {
    'en': [
      {
        pattern: /\b(your)\s+(going|coming|doing)\b/gi,
        message: "Should be 'you're' (you are)",
        suggestion: "you're"
      },
      {
        pattern: /\b(its)\s+(a|an|the|very|really|quite)\b/gi,
        message: "Should be 'it's' (it is)",
        suggestion: "it's"
      },
      {
        pattern: /\b(there)\s+(going|coming|doing)\b/gi,
        message: "Should be 'they're' (they are)",
        suggestion: "they're"
      },
      {
        pattern: /\b(could|should|would)\s+of\b/gi,
        message: "Should be 'have' not 'of'",
        suggestion: "have"
      },
      {
        pattern: /\b(alot)\b/gi,
        message: "Should be two words",
        suggestion: "a lot"
      },
      {
        pattern: /\b(loose)\s+(weight|money|time)\b/gi,
        message: "Should be 'lose' (verb)",
        suggestion: "lose"
      },
      {
        pattern: /\b(affect)\s+(on)\b/gi,
        message: "Should be 'effect on' (noun)",
        suggestion: "effect"
      },
      {
        pattern: /\b(then)\s+(I|you|he|she|we|they)\s+(am|are|is|was|were)\b/gi,
        message: "Should be 'than' for comparison",
        suggestion: "than"
      }
    ],
    'es': [
      {
        pattern: /\b(a)\s+(ver)\b/gi,
        message: "Podría ser 'haber' (verbo auxiliar)",
        suggestion: "haber"
      },
      {
        pattern: /\b(echo)\b/gi,
        message: "Podría ser 'hecho' (participio de hacer)",
        suggestion: "hecho"
      },
      {
        pattern: /\b(asta)\b/gi,
        message: "Debería ser 'hasta' (preposición)",
        suggestion: "hasta"
      }
    ],
    'fr': [
      {
        pattern: /\b(sa)\s+(va)\b/gi,
        message: "Devrait être 'ça va'",
        suggestion: "ça va"
      },
      {
        pattern: /\b(ces)\s+(un|une)\b/gi,
        message: "Devrait être 'c'est'",
        suggestion: "c'est"
      }
    ],
    'de': [
      {
        pattern: /\b(das)\s+(selbe)\b/gi,
        message: "Sollte 'dasselbe' (ein Wort) sein",
        suggestion: "dasselbe"
      },
      {
        pattern: /\b(zu)\s+(mal)\b/gi,
        message: "Sollte 'zumal' (ein Wort) sein",
        suggestion: "zumal"
      }
    ]
  };

  detectLanguage(text: string): string {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const scores: Record<string, number> = {};

    // Initialize scores
    Object.keys(this.commonWords).forEach(lang => {
      scores[lang] = 0;
    });

    // Count matches for each language
    words.forEach(word => {
      Object.entries(this.commonWords).forEach(([lang, commonWords]) => {
        if (commonWords.includes(word)) {
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

  checkSpelling(text: string, language: string): Array<{
    word: string;
    suggestion: string;
    position: number;
    context: string;
  }> {
    const issues: Array<{
      word: string;
      suggestion: string;
      position: number;
      context: string;
    }> = [];

    const misspellings = this.commonMisspellings[language] || this.commonMisspellings['en'];
    
    Object.entries(misspellings).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(text.length, match.index + match[0].length + 20);
        const context = text.substring(start, end);
        
        issues.push({
          word: match[0],
          suggestion: correct,
          position: match.index,
          context: context
        });
      }
    });

    return issues;
  }

  checkGrammar(text: string, language: string): Array<{
    text: string;
    message: string;
    suggestion: string;
    position: number;
    context: string;
  }> {
    const issues: Array<{
      text: string;
      message: string;
      suggestion: string;
      position: number;
      context: string;
    }> = [];

    const rules = this.grammarRules[language] || this.grammarRules['en'];
    
    rules.forEach(rule => {
      let match;
      while ((match = rule.pattern.exec(text)) !== null) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(text.length, match.index + match[0].length + 20);
        const context = text.substring(start, end);
        
        issues.push({
          text: match[0],
          message: rule.message,
          suggestion: rule.suggestion,
          position: match.index,
          context: context
        });
      }
    });

    return issues;
  }

  calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.match(/\b\w+\b/g) || [];
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

  getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German'
    };
    
    return languages[code] || 'Unknown';
  }
}