import { Logger } from '@nestjs/common';
import * as config from 'config';


export class DbConnection {
    static connect() {
        const logger = new Logger('Database Connection!');
        const dbUrl = config.get('dbUrl')
        logger.log(dbUrl)
        return dbUrl
    }
}