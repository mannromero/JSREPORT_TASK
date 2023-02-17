import mysql from 'mysql2/promise';
import {
DB_HOST,
DB_USERNAME,
DB_PASSWORD,
DB_NAME} from '$env/static/private'
/**
 * @type {Promise<mysql.Connection> | null}
 */
let mysqlconn = null;

export function mysqlconnFn() {
      if (!mysqlconn) {
            mysqlconn = mysql.createConnection({
                  host: DB_HOST,
                  user: DB_USERNAME,
                  password:DB_PASSWORD,
                  database: DB_NAME
            });
      }

      return mysqlconn;
}