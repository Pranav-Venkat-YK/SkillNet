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
        })
        .createTable("student", function (table) {
            table.integer("user_id").unsigned().primary().references("id").inTable("users").onDelete("CASCADE");
            table.text("bio");
            table.date("date_of_birth");
            table.string("phone_number");
            table.string("city");
            table.string("country");
            table.string("postal_code");
            table.enu("availability_status", ["not_looking", "actively_looking"]).defaultTo("not_looking");
            table.string("resume_url");
            table.string("linkedin_url");
            table.string("github_url");
            table.timestamps(true, true);
        })
        .createTable("workingprofessional",function (table){
            table.integer("user_id").unsigned().primary().references("id").inTable("users").onDelete("CASCADE");
            table.text("bio");
            table.date("date_of_birth");
            table.string("phone_number");
            table.string("city");
            table.string("country");
            table.string("postal_code");
            table.string("current_position");
            table.string("company_name");
            table.string("industry");
            table.integer("years_of_experience");
            table.enu("availability_status", ["not_looking", "actively_looking"]).defaultTo("not_looking");
            table.string("resume_url");
            table.string("linkedin_url");
            table.string("github_url");
            table.timestamps(true, true);
        });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("organisations").dropTableIfExists("users");
};
