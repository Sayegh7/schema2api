module.exports = function(schema) {
  var routes = [];
  for (var table in schema) {
    if (schema.hasOwnProperty(table)) {
      var columns = schema[table].columns;
      var primaryKey = schema[table].pk;
      var skipPrimary = true;
      var primaryKeyIndex = columns.indexOf(primaryKey);
      if (columns.length == 1 && primaryKey == columns[0]) {
        skipPrimary = false;
      }
      if (primaryKeyIndex > -1 && skipPrimary) {
        columns.splice(columns.indexOf(primaryKey), 1);
      }
      var columnNames = JSON.stringify(columns)
        .replace("[", "(")
        .replace("]", ")");

      var values = [];
      for (var index = 0; index < columns.length; index++) {
        var element = columns[index];
        var before = "'{{ data.";
        var after = " }}'";
        if (element === primaryKey && skipPrimary) {
          continue;
        }
        values.push(before + element + after);
      }
      var valuesArray = "(" + values.toString() + ")";
      var editValues = [];
      for (var index = 0; index < columns.length; index++) {
        var columnName = columns[index];
        var valueName = values[index];
        if (columnName === primaryKey && skipPrimary) {
          continue;
        }
        editValues.push(`${columnName} = ${valueName}`);
      }
      var editValuesString = editValues.toString();
      //   last_name='{{ data.last_name }}', client_id='{{ data.client_id }}'
      var getAllQuery = "SELECT * FROM " + table;
      var postQuery = `INSERT INTO ${table} ${columnNames} VALUES ${valuesArray} RETURNING *`;
      var getOneQuery = `SELECT *  FROM ${table} WHERE ${primaryKey}={{ data.params.${primaryKey} }};`;
      var deleteQuery = `DELETE  FROM ${table} WHERE ${primaryKey}={{ data.params.${primaryKey} }};`;
      var editQuery = `UPDATE ${table} SET ${editValuesString} WHERE ${primaryKey}={{ data.params.${primaryKey} }};${getOneQuery}`;
      //   get all
      routes.push({
        method: "get",
        endpoint: "/" + table,
        query: getAllQuery
      });
      //   create
      routes.push({
        method: "post",
        endpoint: "/" + table,
        query: postQuery
      });

      //   get one
      routes.push({
        method: "get",
        endpoint: `/${table}/:${primaryKey}`,
        query: getOneQuery
      });
      //   delete
      routes.push({
        method: "delete",
        endpoint: `/${table}/:${primaryKey}`,
        query: deleteQuery
      });
      //   edit
      routes.push({
        method: "put",
        endpoint: `/${table}/:${primaryKey}`,
        query: editQuery
      });
    }
  }

  var fs = require("fs");
  var content = JSON.stringify(routes);

  fs.writeFile("./routes.json", content, "utf8", function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Saved to routes.json");
  });
};
