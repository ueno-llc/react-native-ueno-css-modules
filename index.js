const { StyleSheet } = require('react-native');
const { getStylesForProperty } = require('css-to-react-native');

const Dynamic = new Map();
const Themes = new Map();

let theme;

function setVars(obj) {
  Object.entries(obj).forEach(([key, val]) => Dynamic.set(key, val));
}

function setThemeVars(name, obj) {
  const cache = new Map();
  Object.entries(obj).forEach(([key, val]) => cache.set(key, val));
  Themes.set(name, cache);
}

function setTheme(name) {
  theme = name;
}

function getVar(name, fallbackValue) {

  // Find dynamic variable
  if (Dynamic.has(name)) {
    return Dynamic.get(name);
  }

  // Find theme variable
  if (Themes.has(theme)) {
    const Theme = Themes.get(theme);
    if (Theme.has(name)) {
      return Theme.get(name);
    }
  }

  return fallbackValue;
}

function mapStyles(styles) {

  // Cache builder for StyleSheet.create
  const cache = {};
  const dynamic = {};

  // .className
  for (const className in styles) {
    cache[className] = {};
    dynamic[className] = {};

    // propertyName: propertyValue;
    for (const propertyName in styles[className]) {
      const propertyValue = styles[className][propertyName];
      cache[className][propertyName] = propertyValue;

      // Check if propertyValue is string
      if (typeof propertyValue === 'string') {

        // Check for properties that include css3 variables
        const isCssVariable = propertyValue.match(/var\((.*?)(,.*)?\)/);

        if (isCssVariable) {
          delete cache[className][propertyName];

          // Includes default value?
          if (isCssVariable[2]) {
            Object.assign(cache[className], getStylesForProperty(propertyName, isCssVariable[2].substr(1)));
          }

          if (Dynamic.has(isCssVariable[1].trim())) {
            dynamic[className][propertyName] = propertyValue;
          } else {
            // Loop through themes and check for prop names
            Themes.forEach((themeVars, themeName) => {
              const themeClassName = `${className}__theme-${themeName}`;
              const propVarValue = propertyValue.replace(/var\((.*?)(,.*)?\)/, (str, varName, defaultValue) => {
                if (themeVars.has(varName.trim())) {
                  return themeVars.get(varName.trim());
                }
                if (defaultValue) {
                  return defaultValue.substr(1);
                }
                return null;
              });

              // Ensure theme classNames
              cache[themeClassName] = cache[themeClassName] || {};

              // Assign new property values
              if (propVarValue) {
                Object.assign(cache[themeClassName], getStylesForProperty(propertyName, propVarValue));
              }
            });
          }
        }
      }
    }
  }

  const sheet = StyleSheet.create(cache);

  // Dynamic styles
  function getDynamicStyles(className) {
    const res = {};
    for (propertyName in dynamic[className]) {
      const propertyValue = styles[className][propertyName];
      const propVarValue = propertyValue.replace(/var\((.*?)(,.*)?\)/, (str, varName, defaultValue) => {
        if (Dynamic.has(varName.trim())) {
          return Dynamic.get(varName.trim());
        }
        if (defaultValue) {
          return defaultValue.substr(1);
        }
        return null;
      });

      if (propVarValue) {
        Object.assign(res, getStylesForProperty(propertyName, propVarValue));
      }
    }
    return res;
  }

  function getClassNamesForKey(key) {
    return [
      // Add base className
      sheet[key],
      // Add theme variables
      sheet[`${key}__theme-${theme}`],
      // Add dynamic variables
      getDynamicStyles(key),
    ].filter(n => {
      if (n instanceof Array) {
        return n.length === 0;
      }

      if (typeof n === 'object' && n.constructor === Object) {
        return Object.values(n).filter(item => !!item).length > 0;
      }

      return !!n;
    });
  }

  // ClassNames implementation
  function classNames(...args) {
    const classes = [];

    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (!arg) continue;

      const argType = typeof arg;

      if (argType === 'string' && sheet[arg]) {
        classes.push(getClassNamesForKey(arg));
      } else if (argType === 'number') {
        classes.push(arg);
      } else if (Array.isArray(arg) && arg.length) {
        const inner = classNames.apply(null, arg);
        if (inner) {
          classes.push(inner);
        }
      } else if (argType === 'object') {
        for (const key in arg) {
          if ({}.hasOwnProperty.call(arg, key) && arg[key] && sheet[key]) {
            classes.push(getClassNamesForKey(key));
          }
        }
      }
    }

    return classes;
  }

  for (const key in sheet) {
    classNames[key] = getClassNamesForKey(key);
  }

  return classNames;
};

module.exports = {
  setVars,
  setThemeVars,
  setTheme,
  mapStyles
}

