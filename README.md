# react-native-ueno-css-modules
React Native CSS Modules with variables and theme support

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
