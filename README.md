# react-native-ueno-css-modules
React Native CSS Modules with variables and theme support

```bash
yarn add react-native-ueno-css-modules

# And optional pre-processors
yarn add node-sass
yarn add stylus
yarn add less
```


### Transformer
```js
const upstreamTransformer = require('metro/src/reactNativeTransformer');
const uenoCssModulesTransformer = require('react-native-ueno-css-modules/transformer');

module.exports.transform = ({ src, filename, options }) => {

  if (filename.endsWith('.css') || filename.endsWith('.styl') || filename.endsWith('.scss') || filename.endsWith('.sass') || filename.endsWith('.less')) {
    return uenoCssModulesTransformer.transform({ src, filename, options });
  }

  return upstreamTransformer.transform({ src, filename, options });
};
```

### Add themes and variables

```jsx
import { setThemeVars, setVars } from 'react-native-ueno-css-modules';

setThemeVars('light', { '--background-color': 'orange' });

setVars({
  '--hairline-width': StyleSheet.hairlineWidth,
  '--mobx-value': [MobxStore, 'propertyName'],
});
```

## Change theme

```jsx
import { setTheme } from 'react-native-ueno-css-modules';

setTheme('dark');
```


## Usage in styles

Refer to the classNames documentation

```jsx
const styles = require('mystyle.css');

styles.foo;
styles({ foo: true });
styles('foo', 'bar', { baz: true });
```

## How this works

Consider the following

```scss
// styles.css
.sample {
  text-align: left;
  font-size: var(--font-size);
  color: var(--primary-color);
}
```

```jsx
// Component.jsx
import { setTheme, setThemeVars, setVar } from 'react-native-ueno-css-modules';

// Set two themes: dark and light
setThemeVars('light', {
  '--primary-color': '#ffffff',
});
setThemeVars('dark', {
  '--primary-color': '#000000',
});

// Set current theme
setTheme('light');

// Themes have to be allocated before requiring css files
const styles = require('styles.css');

// console.log(styles)
{
  sample: {
    textAlign: 'left',
  },
  sample__theme__light: {
    color: '#ffffff',
  },
  sample__theme__dark: {
    color: '#000000',
  },
}

// Set dynamic variable
setVar('--font-size', 16);

// console.log(styles.sample)
[ styles.sample, styles.sample__theme__light, { fontSize: 16 } ];

// Update dynamic style
setVar('--font-size', 21);

// console.log(styles.sample)
[ styles.sample, styles.sample__theme__light, { fontSize: 21 } ];

// Change theme
setTheme('dark');

// console.log(styles.sample)
[ styles.sample, styles.sample__theme__dark, { fontSize: 21 } ];

```