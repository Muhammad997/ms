
const sqlite3=require('sqlite3').verbose();
const db=new sqlite3.Database('./data/memory.db');
db.run('CREATE TABLE IF NOT EXISTS memory(user TEXT,message TEXT)');
module.exports=db;
