# mongoose-advanced-query-string

Query any Model, quickly, dynamically and with a lot of options without writing code related to collections.

It helps making advanced query strings that uses mongoose queries: `find()` and `aggregate()`, and gives the possibility to use and chain `dynamic` `filtering`, `sorting`, `projecting` and `paginating` using query strings.

It handles query strings containing: `fields`, `sort`, `limit` and `page` keywords and `filter` keywords like: `gt`, `gte`, `lt` and `lte`.

## Installation

```bash
$ npm install mongoose-advanced-query-string
```

## Usage

```javascript
const { ApiFeatures } = require('mongoose-advanced-query-string'); // for Find() queries
const { AggregateFeatures } = require('mongoose-advanced-query-string'); // for Aggregate queries

// 1) Example of ApiFeature Call on a mongoose "Model". 
const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort('createdAt')
      .limitFields('-email', '-age')
      .paginate(1, 100);

// Await the query to execute it and get the result.
const docs = await features.query;

/***********************************************************/
/***********************************************************/
// 2) Example of AggregateFeature Call on a mongoose "Model".
const aggFeatures = new AggregateFeatures(
      Model.aggregate([
        {...},
        {...},
        {...},
        {...},
      ]),
      req.query)
      .sort('slug')
      .limitFields('-__v')
      .paginate();

// Await the query to execute it and get the result.
const docs= await aggFeatures.aggregate;

```

## Features
Dynamic querying a mongoose model with a query string, just by chaining functions, and they can be used with any Mongoose.Model.

---

#### ApiFeatures:
Here, the `ApiFeatures` constructor takes as first argument: `Model.find()` which is a query Mongoose query object. The second parameter is the query object that comes with the request (`req.query`).

Available functions that can be chained in any order: `filter`, `sort`, `limiFields`, `paginate`
```javascript
const myQuery = Model.find(); //

const features = new ApiFeatures(myQuery, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

// Await the query to execute it and get the result.
const docs = await features.query;
```


#### AggregateFeatures:
Available functions that can be chained in any order: `sort`, `limiFields`, `paginate`
```javascript
const myAggregation = Model.aggregate([{...},...,{...}]); //

const aggFeatures = new AggregateFeatures(myAggregation, req.query)
      .sort()
      .limitFields()
      .paginate();

// Await the query to execute it and get the result.
const docs= await aggFeatures.aggregate;
```

## Details
Examples will be given, using a simple endpoint: Thread. It represents a simple thread model of a blog, having as fields: name, slug, type, members, online...

```javascript
{{URL}}/threads //endpoints that gives all existing threads in database (triggers Thread.find()).
```

###  [filter()](#filter) : *available only with Find()*
---

Allows to filter documents, by the fields of the collection included in the query string. Example: `domain.com/api/users?age=25&city=New+York`.

   * Equality `request?field=value`;
   * Greater than/Greater than or equal `request?field[gt]=value` `request?field[gte]=`;
   * Lesser than/Lesser than or equal `request?field[lt]=value` `request?field[lte]=`;

```javascript
const { ApiFeatures } = require('mongoose-advanced-query-string');

const features = new ApiFeatures(Model.find(), req.query).filter();

// Get threads that correspond to the query string.
const threads = await features.query;
```

### Query string:
```console
{{URL}}/threads?type=show // find all threads with type equals "show".
{{URL}}/threads?members[gte]=500&type=game // find threads with members count >= 500 AND type equals "game".
{{URL}}/threads?online[lt]=230&type=movie // find threads with curently online members <= 230 AND type equals "game".
```

###  [sort(defaultSort)](#sort):
---
Allows to sort the result in ascending/descending order, if "sort" parameter is included in the query string. If not, `defaultSort` is the default sort fields (can be separated by comma).

   * Asc: `request?sort=field`
   * Desc: `request?sort=-field`
   * Multiple sort: `request?sort=field1,field2,-field3`

```javascript
const { ApiFeatures } = require('mongoose-advanced-query-string'); // for Find() queries
const { AggregateFeatures } = require('mongoose-advanced-query-string'); // for Aggregate queries

const features = new ApiFeatures(Model.find(), req.query).sort(); // will sort depending on the sort parameter in the query string.
//OR
const features = new AggregateFeatures (Model.aggregate(), req.query).sort('-createdAt'); // If no "sort" parameter, will sort by createdAt in descending order.

// Get threads that correspond to the query string.
const threads = await features.query;
```

### Query string:
```console
{{URL}}/threads?sort=postedAt // sort threads with postedAt in ascending order.
{{URL}}/threads?type=show&sort=members // find all threads with type equals "show" and sort by members number in descending order.
{{URL}}/threads?type=game&sort=-postedAt,-members // find threads with type equals "game", and sort by "posted at" first, then in case of equality, will sort by "members number".
```

###  [limitFields(...defaultExcludedFields)](#limitFields):
---
Allows to do a `project` on the resulting set. In other words, it allows to select what fields to output in result. It handles "projection" if "fields" parameter is used in the query string.

   `...defaultExcludedFields`: A list of default fields to be excluded if no "fields" is specified in the query sting

   * Select fields: `request?fields=field1,field2,field3`: Will output a result with only "field1 field2 and field3" in the result.
   * Select All except: `request?fields=-field1,-field2...`: Will output a result with all the fields except for "field1 and field2" in the result.

```javascript
const { ApiFeatures } = require('mongoose-advanced-query-string'); // for Find() queries
const { AggregateFeatures } = require('mongoose-advanced-query-string'); // for Aggregate queries

const features = new ApiFeatures(Model.find(), req.query).limitFields(); // will sort depending on the sort parameter in the query string.
//OR
const features = new AggregateFeatures (Model.aggregate(), req.query).limitFields('__v', '-_id'); // If no "fields" parameter, will exclude by default from the result __v and _id.

// Get threads that correspond to the query string.
const threads = await features.query;
```

### Query string:
```console
{{URL}}/threads?fields=-postedAt,-__v // will exclude "postedAt" and "__v" from the result.
{{URL}}/threads?fields=postedAt,__v // will select only "postedAt" and "__v" in the result.
```
N.B: Mixed values are not accepted.

### [paginate(defaultPage = 1, defaultLimit = 100)](#paginate)
---
Allow to do a get a subset of the resulting set, depending on the parameters used. It takes as parameters: `page` and `limit`.

   * Select fields: `request?page=2&limit=10`: Will output a result with values starting from the 11th element to the 20th. (Starts at page 2, not 1).

```javascript
const { ApiFeatures } = require('mongoose-advanced-query-string'); // for Find() queries
const { AggregateFeatures } = require('mongoose-advanced-query-string'); // for Aggregate queries

const features = new ApiFeatures(Model.find(), req.query).paginate(); // will sort depending on the sort parameter in the query string.
//OR
const features = new AggregateFeatures (Model.aggregate(), req.query).paginate(2, 50); // If no "page" and "limit" parameters, will use pagination with inputted parameters.

// Get threads that correspond to the query string.
const threads = await features.query;
```

### Query string:
```console
{{URL}}/threads // will use pagination by default, where "page = 1" and "limit = 100"
{{URL}}/threads?page=2&limit=20 // will use pagination with "page = 2" and "limit = 20", i.e: documents from 21 to 40.
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change or add.

I'm open to optimize the project as much as it could be.

## License
ISC