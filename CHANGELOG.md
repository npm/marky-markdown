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
