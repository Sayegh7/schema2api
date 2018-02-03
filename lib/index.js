module.exports = function(schema) {
  var routes = [];
  for (var table in schema) {
    if (schema.hasOwnProperty(table)) {
      var columns = schema[table];
      var columnNames = JSON.stringify(columns)
        .replace("[", "(")
        .replace("]", ")");
      var primaryKey = columns[0];
      var values = [];
      for (var index = 0; index < columns.length; index++) {
        var element = columns[index];
        var before = "'{{ data.";
        var after = " }}'";
        values.push(before + element + after);
      }
      var valuesArray = "(" + values.toString() + ")";
      var editValues = [];
      for (var index = 0; index < columns.length; index++) {
        var columnName = columns[index];
        var valueName = values[index];
        editValues.push(`${columnName} = ${valueName}`);
      }
      var editValuesString = editValues.toString();
      //   last_name='{{ data.last_name }}', client_id='{{ data.client_id }}'
      var getAllQuery = "SELECT * FROM " + table;
      var postQuery = `INSERT INTO ${table} ${columnNames} VALUES ${valuesArray} RETURNING *`;
      var getOneQuery = `SELECT *  FROM ${table} WHERE ${primaryKey}={{ params.${primaryKey} }};`;
      var deleteQuery = `DELETE  FROM ${table} WHERE ${primaryKey}={{ params.${primaryKey} }};`;
      var editQuery = `UPDATE ${table} SET ${editValuesString} WHERE ${primaryKey}={{ params.${primaryKey} }};${getOneQuery}`;
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
        endpoint: `/${table}/${primaryKey}`,
        query: getOneQuery
      });
      //   delete
      routes.push({
        method: "delete",
        endpoint: `/${table}/${primaryKey}`,
        query: deleteQuery
      });
      //   edit
      routes.push({
        method: "put",
        endpoint: `/${table}/${primaryKey}`,
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
    console.log("The file was saved!");
  });
};
