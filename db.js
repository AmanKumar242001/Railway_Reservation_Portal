
const {Pool}=require('pg');

const pool=new Pool({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"12345",
    database:"postgres"
});

module.exports=pool;