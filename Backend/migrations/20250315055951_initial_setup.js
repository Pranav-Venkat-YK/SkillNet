exports.up = function (knex) {
    return knex.schema
        .createTable("users", function (table) {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.string("email").unique().notNullable();
            table.string("password").notNullable();
            table.timestamps(true, true);
        })
        .createTable("organisations", function (table) {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.string("email").unique().notNullable();
            table.string("password").notNullable();
            table.string("Description");
            table.string("industry");
            table.string("founded_date");
            table.string("headquarters_address");
            table.integer("pincode");
            table.string("city");
            table.string("state");
            table.string("country");
            table.string("website_url");
            table.timestamps(true, true);
        });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("organisations").dropTableIfExists("users");
};
