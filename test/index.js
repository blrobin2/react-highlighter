const test = require('tape');
const h = require('react-hyperscript');
const { i, ul, li, div, span } = require('hyperscript-helpers')(h);
const ReactDOMServer = require('react-dom/server');
const {
  defaultToken,
  defaultHighlighter,
  tokenFactory,
  highlighterFactory
} = require('..');


const foo = () => div('', span('', 'foo'));
const highlightedFoo = className => div('', span('', i(className, 'foo')));

const original = ul('', [
  li({ key: '1' }, 'foo'),
  li({ key: '2' }, 'Bar'),
  li({ key: '3' }, 'BAZ'),
  li({ key: '4' }, 'buZZ'),
  li({ key: '5' }, [
    'buzz',
    foo()
  ]),
  li({ key: '6' }, div('', 1))
]);

test('it can highlight', t => {
  t.plan(1);

  const highlighted = defaultHighlighter(original, 'buzz');

  const expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, i('.highlight', 'buZZ')),
    li({ key: '5' }, [
      i('.highlight', 'buzz'),
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);
});

test('it can highlight case-sensitive', t => {
  t.plan(2);

  let token = defaultToken('buzz');
  let highlighted = highlighterFactory({ sensitiveSearch: true })([token])(original);
  const expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, 'buZZ'),
    li({ key: '5' }, [
      i('.highlight', 'buzz'),
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);

  token = tokenFactory({ sensitiveSearch: true })('buzz');
  highlighted = highlighterFactory({})([token])(original);

  domsRenderEqually(t, highlighted, expected);
});

test('it can highlight with custom class names', t => {
  t.plan(3);

  let token = tokenFactory({ className: 'special' })('buzz');
  let highlighted = highlighterFactory({})([token])(original);
  let expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, i('.special', 'buZZ')),
    li({ key: '5' }, [
      i('.special', 'buzz'),
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);

  highlighted = highlighterFactory({ className: 'all-special' })([token])(original);
  expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, i('.special.all-special', 'buZZ')),
    li({ key: '5' }, [
      i('.special.all-special', 'buzz'),
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);

  token = defaultToken('buzz');
  highlighted = highlighterFactory({ className: 'all-special' })([token])(original);
  expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, i('.highlight.all-special', 'buZZ')),
    li({ key: '5' }, [
      i('.highlight.all-special', 'buzz'),
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);
});

test('it can accept multiple tokens', t => {
  t.plan(1);

  const buzzToken = defaultToken('buzz');
  const fooToken = tokenFactory({ className: 'special' })('foo');
  const highlighted = highlighterFactory({})([buzzToken, fooToken])(original);

  const expected = ul('', [
    li({ key: '1' }, i('.special', 'foo')),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, i('.highlight', 'buZZ')),
    li({ key: '5' }, [
      i('.highlight', 'buzz'),
      highlightedFoo('.special')
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);
});

test('it can match with RegEx', t => {
  t.plan(2);

  let token = defaultToken('^b');
  let highlighted = highlighterFactory({})([token])(original);
  let expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, [i('.highlight', 'B'), 'ar']),
    li({ key: '3' }, [i('.highlight', 'B'), 'AZ']),
    li({ key: '4' }, [i('.highlight', 'b'), 'uZZ']),
    li({ key: '5' }, [
      i('.highlight', 'b'),
      'uzz',
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);

  token = tokenFactory({ sensitiveSearch: true })('^b');
  highlighted = highlighterFactory({})([token])(original);
  expected = ul('', [
    li({ key: '1' }, 'foo'),
    li({ key: '2' }, 'Bar'),
    li({ key: '3' }, 'BAZ'),
    li({ key: '4' }, [i('.highlight', 'b'), 'uZZ']),
    li({ key: '5' }, [
      i('.highlight', 'b'),
      'uzz',
      foo()
    ]),
    li({ key: '6' }, div('', 1))
  ]);

  domsRenderEqually(t, highlighted, expected);
});

function domsRenderEqually(t, actual, expected) {
  t.equal(
    ReactDOMServer.renderToString(actual),
    ReactDOMServer.renderToString(expected),
    'DOMs should be the same'
  );
}
