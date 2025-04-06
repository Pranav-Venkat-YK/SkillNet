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
            table.text("name");
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
            table.text("name");
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
        })
        .createTable("education", function(table) {
            table.integer("user_id").unsigned().primary().references("id").inTable("users").onDelete("CASCADE");
            table.decimal("tenth_grade", 5, 2);  
            table.string("tenth_board");
            table.string("tenth_school");
            table.decimal("twelveth_grade", 5, 2);  
            table.string("twelveth_course_combination");
            table.string("twelveth_college");
            table.decimal("degree_grade", 5, 2); 
            table.string("degree_course");
            table.string("degree_university");
            table.decimal("postdegree_grade", 5, 2); 
            table.string("postdegree_course");
            table.string("postdegree_university");
        })
        .createTable("jobs", function (table) {
            table.increments("job_id").primary();
            table.integer("id").unsigned().references("id").inTable("organisations").notNullable();
            table.string("title").notNullable();
            table.text("description").notNullable();
            table.text("requirements");
            table.text("responsibilities");
            table.string("location");
            table.boolean("is_remote");
            table.decimal("salary_min", 10, 2);
            table.decimal("salary_max", 10, 2);
            table.string("salary_currency");
            table.enu("employment_type", ["full-time", "part-time"]);
            table.string("experience_level");
            table.enu("education_level", ["12th", "UnderGraduate", "PostGraduate", "PhD"]);
            table.string("domain_of_study");
            table.date("application_deadline");
            table.enu("status", ["open", "closed"]).defaultTo("open");
            table.integer("views_count").defaultTo(0);
            table.integer("applications_count").defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable("applications", function (table) {
            table.increments("application_id").primary();
            table.integer("job_id").unsigned().references("job_id").inTable("jobs").notNullable();
            table.integer("user_id").unsigned().references("id").inTable("users").notNullable();
            table.string("resume_url");
            table.enu("status", ["applied", "viewed","shortlisted", "interviewing", "hired", "rejected"]).defaultTo("applied");
            table.timestamp("applied_at").defaultTo(knex.fn.now());
            table.timestamp("updated_at").defaultTo(knex.fn.now());
            table.unique(["job_id", "user_id"]);
        })
        .createTable("interviews", function (table) {
            table.increments("interview_id").primary();
            table.integer("application_id").unsigned().references("application_id").inTable("applications").notNullable();
            table.datetime("scheduled_time").notNullable();
            table.integer("duration_minutes").notNullable();
            table.enu("interview_type", ["phone", "video", "in_person"]);
            table.string("location_or_link");
            table.string("interviewer_name");
            table.string("interviewer_position");
            table.enu("status", ["scheduled", "completed", "cancelled", "rescheduled"]).defaultTo("scheduled");
            table.text("feedback");
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.timestamp("updated_at").defaultTo(knex.fn.now());
        })
        .createTable("bookmarks", function (table) {
            table.increments("bookmark_id").primary();
            table.integer("job_id").unsigned().references("job_id").inTable("jobs").notNullable();
            table.integer("user_id").unsigned().references("id").inTable("users").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.unique(["job_id", "user_id"]);
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("bookmarks")
        .dropTableIfExists("interviews")
        .dropTableIfExists("applications")
        .dropTableIfExists("jobs")
        .dropTableIfExists("education")
        .dropTableIfExists("workingprofessional")
        .dropTableIfExists("student")
        .dropTableIfExists("organisations")
        .dropTableIfExists("users");
};