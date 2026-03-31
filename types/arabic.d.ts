declare module 'arabic-reshaper' {
  export function convertArabic(text: string): string;
}

declare module 'rtl-detect' {
  export function isRtl(text: string): boolean;
}

declare module 'bidi-js' {
  interface BidiInstance {
    getReorderedString(text: string): string;
    getReorderSegments(text: string): any[];
    getEmbeddingLevels(text: string): number[];
    getBidiCharType(char: string): string;
    getBidiCharTypeName(char: string): string;
    getMirroredCharacter(char: string): string;
    getMirroredCharactersMap(): any;
    getCanonicalBracket(char: string): string;
    openingToClosingBracket: any;
    closingToOpeningBracket: any;
  }
  
  function bidiFactory(): BidiInstance;
  export = bidiFactory;
}
