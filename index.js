const { default: traverse } = require('react-traverse');
const h = require('react-hyperscript');
const { i } = require('hyperscript-helpers')(h);

const tokenFactory = ({
  className = 'highlight',
  sensitiveSearch = false
}) => highlightText => ({
  token: highlightText.replace(/\|$/, ''),
  className,
  sensitiveSearch
});

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

function checkAndReplace(node, tokens, classNameAll, sensitiveSearchAll) {
  return tokens.reduce((newText, { token, className, sensitiveSearch }) => {
    const classList = classNameAll ? [className, classNameAll] : [className];
    const finalSensitiveSearch = sensitiveSearchAll ? sensitiveSearchAll : sensitiveSearch;

    return checkToken(newText, token, classList, finalSensitiveSearch);
  }, node);
}

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

module.exports = {
  tokenFactory,
  highlighterFactory,
  defaultHighlighter: (dom, text) => highlighterFactory({})([tokenFactory({})(text)])(dom)
};
