# Individual Championships

Manage individual championships organizations.

## JSON format

### Organization

```js
/**
 * @typedef {Object} OrganizationObj
 * @property {TeamObj[]} teamList
 * @property {ContestantObj[]} contestantList
 * @property {ChampionshipObj[]} championshipList
 * @property {?string} contestantGroupBy
 * @property {?string} contestantSortBy
 * @property {number} timestamp
 * @property {?string} version
 */
```

### Team

```js
/**
 * @typedef {Object} TeamObj
 * @property {number} index
 * @property {string} name
 */
```

### Contestant

```js
/**
 * @typedef {Object} ContestantObj
 * @property {number} index
 * @property {string} name
 * @property {?number} team
 */
```

### Championship

```js
/**
 * @typedef {Object} ChampionshipObj
 * @property {string} name
 * @property {number} unitCap
 * @property {number} gameCap
 * @property {RoundObj[]} roundList
 */
```

### Round

```js
/**
 * @typedef {Object} RoundObj
 * @property {UnitObj[]} unitList
 * @property {GameObj[]} gameList
 */
```

### Unit

```js
/**
 * @typedef {Object} UnitObj
 * @property {number[]} contestantList
 * @property {boolean} pass
 * @property {?number} parent
 */
```

### Game

```js
/**
 * @typedef {number[]} GameObj
 */
```
