class AggregateFeatures {
  constructor(aggregate, queryString) {
    this.aggregate = aggregate;
    this.queryString = queryString;
  }

  limitFields(...defaultExcludedFields) {
    const fields = {};
    if (this.queryString.fields) {
      this.queryString.fields.split(',').forEach((el) => {
        if (el.startsWith('-')) {
          el = el.substring(1);
          fields[el] = 0;
        } else {
          fields[el] = 1;
        }
      });
      this.aggregate.pipeline().push({ $project: fields });
    } else {
      if (defaultExcludedFields.length !== 0) {
        defaultExcludedFields.forEach((el) => {
          fields[el] = 0;
        });
        this.aggregate.pipeline().push({
          $project: fields,
        });
      }
    }
    return this;
  }

  sort(defaultSort) {
    if (this.queryString.sort) {
      const sortBy = {};

      this.queryString.sort.split(',').forEach((el) => {
        if (el.startsWith('-')) {
          el = el.substring(1);
          sortBy[el] = -1;
        } else {
          sortBy[el] = 1;
        }
      });

      this.aggregate.pipeline().push({ $sort: sortBy });
    } else {
      if (defaultSort) {
        if (defaultSort.startsWith('-')) {
          this.aggregate.pipeline().push({
            $sort: { [defaultSort.substring(1)]: -1 },
          });
        } else {
          this.aggregate.pipeline().push({
            $sort: { [defaultSort]: 1 },
          });
        }
      }
    }
    return this;
  }

  paginate(defaultPage = 1, defaultLimit = 100) {
    const page = this.queryString.page * 1 || defaultPage;
    const limit = this.queryString.limit * 1 || defaultLimit;
    const skip = (page - 1) * limit;

    this.aggregate.pipeline().push({ $skip: skip }, { $limit: limit });

    return this;
  }
}

module.exports = AggregateFeatures;
