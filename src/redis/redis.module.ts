// import { Module, Global } from '@nestjs/common';
// import { createClient } from 'redis';
// import { mode } from 'src/utils/constants';
// export const REDIS = 'REDIS_CONNECTION';



// @Global()
// @Module({
//   providers: [
//     {
//       provide: REDIS,
//       useFactory: async () => {
//         const client = createClient({
//           url: mode == "PROD" ? process.env.REDIS_URL : process.env.REDIS_URL_LOCAL ,
//         });

//         client.on('connect', () => console.log(' Redis connected'));
//         client.on('error', (err) => console.error('Redis error', err));
        
      
//         await client.connect();

//         return client;
//       },
//     },
//   ],
//   exports: [REDIS],
// })
// export class RedisModule {}
