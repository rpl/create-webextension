# create-webextension

This npm package provides a CLI utility to create a new simple (and mostly blank) WebExtension
with only one command.

You can use it by installing the npm package globally (`npm install -g create-webextension`)
or by using `yarn create` as an "always updated" shortcut:

```
yarn create webextension my-webextension-project
```

[![create-webextension in action][screenshot]][screencast]

## Contributing

`create-webextension` currently support only a single basic WebExtension template
(which is mostly blank), but we can definitely evaluate to support some additional templates
(e.g. a template which already provides a setup which includes the webextension-polyfill,
babel, unit tests, linting,  webpack/browserify configurations etc.).

**Pull Requests are welcome ;-)**

[screenshot]: https://raw.githubusercontent.com/rpl/create-webextension/master/assets/screenshot.png
[screencast]: https://youtu.be/jfGqhvOCpj8
