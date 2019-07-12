# React Highlighter

A simple library for highlighting custom text

## Why?

Say you have a search feature and you want to highlight text, not just within text content, but throughout an entire DOM tree. That's what this library helps you accommplish.

## How?

By passing in the React component that is the root of your DOM tree and whatever text you are looking to highlight

## Features
* Custom class names for individual matches or for every match
* Case-senstive matching (defaults to off)
* Multiple different matches with previously mentioned customizations
* RegEx-supported matches

## Usage

By default, you can use the default highlighter, which highlights the given text with the class 'highlight':

```javascript
import { defaultHighlighter } from 'react-highlighter';

const DOM = // ... some React Component or tree
const highlighted = defaultHighlighter(DOM, 'words to highlight');
```

You can also provide customization for tokens (matches to look for) and for the highlighter itself:

```javascript
import { tokenFactory, highlighterFactory } from 'react-highlighter';

const DOM = // ... some React Component or tree

const buzzToken = tokenFactory({
  sensitiveSearch: true, // whether or not the passed phrase should match exact case
  className: 'buzz', // the class name to give a matched case
})('buzz');
const fooToken = tokenFactory({})('foo$'); // No arguments, regex for 'ends in foo'
const highlighted = highlighterFactory({
  sensitiveSearch: true, // if passed, overrides all passed tokens sensitiveSearch
  className: 'match-all', // in addition to the class names set in the tokens, each match will also get this class
})
([buzzToken, fooToken]) // list of tokens
(DOM);
```

You can mix-and-match the usage above to arrive at your custom highlighting needs.

## Bugs? Questions?
Submit a pull request!

## Enhancements?
Probably not! This is pretty full-featured as is, anything further would probably be scope creep. However, please feel free to use this as a base for your library