// Type definitions for react-native-ueno-css-modules 1.0.0

decalre function setVar(name: string, value: any): void;
declare function setVars(obj: Object): void;
declare function setThemeVars(name: string, obj: Object): void;
declare function setTheme(name: string): void;
declare function getVar(name: string): any;
declare function mapStyles(obj: Object): void;
declare var Themes: Map;
declare var Dynamic: Map;

export module UenoCSSModules {
  setVar;
  setVars;
  setThemeVars;
  setTheme;
  getVar;
  mapStyles;
  Themes;
  Dynamic;
}

