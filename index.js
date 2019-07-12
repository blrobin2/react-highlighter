const { default: traverse } = require('react-traverse');
const h = require('react-hyperscript');
const { i } = require('hyperscript-helpers')(h);

// Type Token = { token: string, className: string, senstiveSearch: boolean }

/*
 * Function: tokenFactory :: { className?: string, sensitiveSearch?: boolean }
 *             -> highlightText: string
 *             -> Token
 */
const tokenFactory = ({
  className = 'highlight',
  sensitiveSearch = false
}) => highlightText => ({
  token: highlightText.replace(/\|$/, ''),
  className,
  sensitiveSearch
});

/*
 * Function: highlighterFactory :: { className?: string, sensitiveSearch?: boolean }
 *                              -> tokens: Token[]
 *                              -> container: HtmlElement
 *                              -> HtmlElement
 */
const highlighterFactory = ({
  className = null,
  sensitiveSearch = false
}) => tokens => container => {
  return traverse(container, {
    Text(path) {
      if (typeof path.node === 'string') {
        return checkAndReplace(path.node, tokens, className, sensitiveSearch);
      }
      return path.node;
    }
  })
};

/**
 * Uses the given tokens and options to parse textContent and return a tree
 * with the matching cases highlighted
 * @param {string} node The text content to parse
 * @param {Array.<Token>} tokens The tokens for matching
 * @param {string} classNameAll The class name for every matching element
 * @param {boolean} sensitiveSearchAll Whether or not to peform a case-sensitive search
 * @returns {HtmlElement} The DOM with given tokens highlighted
 */
function checkAndReplace(node, tokens, classNameAll, sensitiveSearchAll) {
  return tokens.reduce((newText, { token, className, sensitiveSearch }) => {
    const classList = classNameAll ? [className, classNameAll] : [className];
    const finalSensitiveSearch = sensitiveSearchAll ? sensitiveSearchAll : sensitiveSearch;

    return checkToken(newText, token, classList, finalSensitiveSearch);
  }, node);
}

/**
 * Uses the given token and options to parse textContent and return a tree
 * with the matching cases highlighted
 * @param {string} nodeValue // The text content to search
 * @param {string} token The text or regex on which to match
 * @param {Array.<string>} classList The classes to apply to the match case
 * @param {boolean} sensitiveSearch Whether to use sensitive search
 * @returns {HtmlElement} The matches for the given token
 */
function checkToken(nodeValue, token, classList, sensitiveSearch) {
  const go = (newText, remainingText, isFirst) => {
    const flags = sensitiveSearch ? 'gm' : 'igm';
    let matches;
    try {
      matches = remainingText.match(new RegExp(token, flags)) || [];
    } catch (_) {
      matches = [];
    }
    if (matches.length === 0) {
      if (isFirst) return remainingText;
      if (remainingText) return newText.concat(remainingText);
      return newText;
    }

    const classes = classList.map(c => `.${c}`).join(' ');
    const [nextNewText, nextRemainingText] = matches.reduce(([finalText, remainingText], match) => {
      const foundIndex = remainingText.indexOf(match);
      const begin = remainingText.substring(0, foundIndex);
      const matched = remainingText.substr(foundIndex, match.length);
      return [
        finalText.concat([begin, i(classes, matched)]),
        remainingText.substring(foundIndex + match.length)
      ];
    }, [newText, remainingText]);

    return go(nextNewText, nextRemainingText, false);
  }

  return go([], nodeValue, true);
}

const defaultToken = tokenFactory({});
const defaultHighlighter = (dom, text) => highlighterFactory({})([defaultToken(text)])(dom);

module.exports = {
  tokenFactory,
  highlighterFactory,
  defaultToken,
  defaultHighlighter
};
