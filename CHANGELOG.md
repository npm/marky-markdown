# 7.0.2 (2016-07-06)

- fixed a bug where markdown headings containing HTML links were still
  wrongly being wrapped with generated anchor links ([issue/200], [pull/201])

[issue/200]: https://github.com/npm/marky-markdown/issues/200
[pull/201]: https://github.com/npm/marky-markdown/pull/201

# 7.0.1 (2016-05-28)

- removed some unused configuration option handling from the process
  by which we wrap markdown code blocks ([pull/154])

### Tests

- unit tests were breaking when dependencies's READMEs weren't in
  our file tree (specifically mocha, a devDependency); now we skip
  trying to process those ([pull/184])
- a dependency was leaking a variable into the global scope; now we
  test for that; thanks [aredridel]! ([issue/180], [pull/186])
- added some tests to make sure marky doesn't accidentally do
  mustache template variable replacement ([issue/160], [pull/161])


### Dependencies

- `glob` updated to `7.0.0` ([pull/150])
- `lodash.pickBy` updated to `4.2.1` ([pull/155])
- `github-url-to-object` held at `2.1.0` ([pull/158]) pending
  resolution of [github-url-to-object-issue-19]
- `standard` updated to `7.1.0` ([pull/179])
- `mocha` updated to `2.5.2` ([pull/184])
- `markdown-it-emoji` updated to `1.2.0` ([pull/189])

[aredridel]: https://github.com/aredridel
[pull/150]: https://github.com/npm/marky-markdown/pull/150
[pull/154]: https://github.com/npm/marky-markdown/pull/154
[pull/155]: https://github.com/npm/marky-markdown/pull/155
[pull/158]: https://github.com/npm/marky-markdown/pull/158
[issue/160]: https://github.com/npm/marky-markdown/issues/160
[pull/161]: https://github.com/npm/marky-markdown/pull/161
[github-url-to-object-issue-19]: https://github.com/zeke/github-url-to-object/issues/19
[pull/179]: https://github.com/npm/marky-markdown/pull/179
[issue/180]: https://github.com/npm/marky-markdown/issues/180
[pull/184]: https://github.com/npm/marky-markdown/pull/184
[pull/186]: https://github.com/npm/marky-markdown/pull/186
[pull/189]: https://github.com/npm/marky-markdown/pull/189

# 7.0.0 (2016-02-08)

### Breaking Changes

- updated `markdown-it` to `5.1.0` that broke the behavior of
  fenced code blocks. updated tests to reflect new behavior.
  ([pull/100]) by [revin]
- we were seeing rendering issues because `markdown-it` does not
  do anything with tab characters in fenced code blocks. we now
  convert tab characters into four-spaces, which follows Github
  flavored markdown ([issue/126],[pull/127]) by [revin]
- converts emoji in heading IDs to emoji shortcode names to more
  closely match Github flavored markdown ([issue/128], [pull/133])
  filed by [chrisdickinson], fixed by [revin]

[pull/100]: https://github.com/npm/marky-markdown/pull/100
[pull/127]: https://github.com/npm/marky-markdown/pull/127
[issue/126]: https://github.com/npm/marky-markdown/issues/126
[issue/128]: https://github.com/npm/marky-markdown/issues/128
[pull/133]: https://github.com/npm/marky-markdown/pull/133
[chrisdickinson]: https://github.com/chrisdickinson

# 6.0.4 (2016-02-08)

### Documentation

- badges about the time til close for PRs and issues were added to
  the `README` by [ashleygwilliams]
- a line about `:emoji:` conversion was added to the `README` by
  [revin]
- a trailing comma in the options description was removed by [revin]

### Tests

- originally we were installing some packages as `devDependencies` in 
  order to use their `README`s in tests. this became an issue when
  greenkeeper would attempt to update them and break our tests :) 
  we now have pulled in the `README`s as static assets ([issue/91]
  [pull/114]), by [revin]
- tests were all in a single file, broken up in categories
  ([issue/122], [pull/123]) by [revin]
- test coverage was greatly improved ([pull/138]) by [revin]
  - our `packagize` module would error out if the package provided,
    lacked a name, `if()` guard added
  - ensure that `cdn` module bails if there isn't sufficient package
    data supplied
  - add a few lines to  `github.md` test fixture to make sure it
    handles `<img>` elements with a blank/missing `src` attribute
    and `<a>` elements with a blank/missing `href`
  - ensure running marky with `{debug: true}` produces the same output
    as normal execution

[issue/91]: https://github.com/npm/marky-markdown/issues/91
[pull/114]: https://github.com/npm/marky-markdown/pull/114
[issue/122]: https://github.com/npm/marky-markdown/issues/122
[pull/123]: https://github.com/npm/marky-markdown/pull/123
[pull/138]: https://github.com/npm/marky-markdown/pull/138

### Bug Fixes

- any URL containing "//youtube.com" was make it through our iframe
  filter, but the intent was to only allow actual YouTube URLs. 
  ([issue/108], [pull/110]), filed by [lovasoa],  solved by [revin]

[lovasoa]: https://github.com/lovasoa
[issue/108]: https://github.com/npm/marky-markdown/issues/108
[pull/110]: https://github.com/npm/marky-markdown/pull/110

### Dependencies

- `glob` updated to `6.0.4` ([pull/101])
- remove `front-matter` ([pull/134]) by [revin]
- `cheerio` updated to `0.20.0` ([pull/135])
- `lodash` updated to `4.2.0` ([pull/136])
- `standard` updated to `6.0.4` ([pull/144]) by [Flet]

[pull/134]: https://github.com/npm/marky-markdown/pull/134
[pull/101]: https://github.com/npm/marky-markdown/pull/101
[pull/135]: https://github.com/npm/marky-markdown/pull/135
[pull/136]: https://github.com/npm/marky-markdown/pull/136
[pull/144]: https://github.com/npm/marky-markdown/pull/144

### Other

- some code existed for creating meta tags based on `README`
  frontmatter that was not being used. it and its tests were removed.
  ([issue/43], [pull/116]) by [revin]
- a small module for removing HTML comments was still in the codebase
  but had not been used in a while. was finally fully removed
  ([pull/121]) by [revin]

[pull/121]: https://github.com/npm/marky-markdown/pull/121
[issue/43]: https://github.com/npm/marky-markdown/issues/43
[pull/116]: https://github.com/npm/marky-markdown/pull/116

# 6.0.3 (2016-01-14)

### Bug Fix

- we strip `h1` tags from `README`s that have the same content as the
  package name, however we did not update this feature to account for
  scoped package names, e.g. @scope/pkg. now we remove the scope from
  the package meta-data to check the `README`'s `h1`. 
  ([issue/48][pull/103]) - reported by [sindresorhus], solved by [revin]

### Documentation

- fix syntax error in code example re: npm package parsing ([pull/102]) -
  by [latentflip]
- updated `README` to reflect current list of dependencies -
  ([pull/107]) - by [revin]
- updated author in `package.json` to reflect [ashleygwilliams] is current
  maintainer ([pull/112]) - by [ashleygwilliams]

### Dependencies

- upgraded to `lodash 4.0.0` ([pull/106])- by [revin]

# 6.0.2 (2016-01-11)

### Bug Fix

- we were parsing `:)` into emoji, though this is not the desired behavior.
  disabled shortcut emoji parsing in the markdown-it-emoji plugin. 
  ([issue/95], [pull/97]) - reported by [cloakedninjas], solved by [revin]

# 6.0.1 (2016-01-07)

### Bug Fix

- `markdown-it@5.1.0` would break the build, so `package.json` was updated
  to hold at minor version, `~5.0.2` ([pull/90][pull/93]) - by [ashleygwilliams]

# 6.0.0 (2016-01-06)

### Breaking Changes

- ✨emoji support✨, ([issues/59], [pull/87]) - by [patriciarealini]
- Github style anchor IDs ([pull/56]) - by [Flet]
- support lazy headers, e.g., `#lookmanospace` ([issues/39], [pull/82]) - by     [revin]

### New Features

- diff syntax highlighting ([issues/64], [pull/84]) - by [revin]
- auto-linkify qualified URLs ([pull/79]) - by [zeke]
- whitelist `ins`, `del`, `sub`, `sup` HTML tags ([issues/55], [pull/83]) - by [revin]

[latentflip]: https://github.com/latentflip
[pull/112]: https://github.com/npm/marky-markdown/pull/112
[pull/107]: https://github.com/npm/marky-markdown/pull/107
[pull/102]: https://github.com/npm/marky-markdown/pull/102
[pull/106]: https://github.com/npm/marky-markdown/pull/106
[sindresorhus]: https://github.com/sindresorhus
[pull/103]: https://github.com/npm/marky-markdown/pull/103
[issue/48]: https://github.com/npm/marky-markdown/issues/48
[cloakedninjas]: https://github.com/cloakedninjas
[pull/97]: https://github.com/npm/marky-markdown/pull/97
[issue/95]: https://github.com/npm/marky-markdown/issues/95
[ashleygwilliams]: https://github.com/ashleygwilliams
[pull/90]: https://github.com/npm/marky-markdown/pull/90
[pull/93]: https://github.com/npm/marky-markdown/pull/93
[issues/59]: https://github.com/npm/marky-markdown/issues/59
[pull/87]: https://github.com/npm/marky-markdown/pull/87
[patriciarealini]: https://github.com/patriciarealini
[issues/64]: https://github.com/npm/marky-markdown/issues/64
[pull/84]: https://github.com/npm/marky-markdown/pull/84
[revin]: https://github.com/revin
[pull/56]: https://github.com/npm/marky-markdown/pull/56
[Flet]: https://github.com/Flet
[pull/79]: https://github.com/npm/marky-markdown/pull/79
[zeke]: https://github.com/zeke
[issues/55]: https://github.com/npm/marky-markdown/issues/55
[pull/83]: https://github.com/npm/marky-markdown/pull/83
[issues/39]: https://github.com/npm/marky-markdown/issues/39
[pull/82]: https://github.com/npm/marky-markdown/pull/82
