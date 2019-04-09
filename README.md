# webpack docgen plugin

Automatically generate documentation for js function.

## Install

```
npm i -D webapck-docgen-pulgin
```

## Useage

```

  plugins: [
    new DocGenPlugin({
      docFile: 'list.md', // document file name
      title: 'Utils list', // document title
      description: 'Function & Modules list.', // document description
      entry: './src/index.js' // string | [string] | object { <key>: string | string }  <files path>
    })
  ]

```

```

  plugins: [
    new DocGenPlugin({
      dir: './src' // string < directory path >
    })
  ]

```

## Example

```
src
├── date
│   └── index.js
├── index.js
└── test
    └── index.js
```

```
//index.js

/**
 * @name format
 * @description Converts time into the specified format
 * @param {String|Number} time - time to format
 * @param {String=} fmt
 * @return {String}
 */
function format(time, fmt) {
  fmt = fmt || 'yyyy-MM-dd';
  time = timestamp(time);
  let date = new Date(time);
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    let str = o[k] + '';
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
}
```
```
list.md

# Utils list

 Function & Modules list.

## home/index

### format

>Converts time into the specified format

| params | type          | required | description |
| ------ | ------------- | -------- | ----------- |
| time   | String/Number | Yes      |  time to format   |
| fmt   | String | No      |     |

>return {String}

```

## Demo

[https://github.com/webkong/js-utils](https://github.com/webkong/js-utils)

## License

[MIT](http://opensource.org/licenses/MIT)

## Author

![me](https://s.gravatar.com/avatar/1fe24100ab2109076fd777d1ad0a28c5?s=100)
